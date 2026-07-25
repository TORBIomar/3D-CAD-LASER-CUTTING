import { CadState, MATERIALS } from '../store/useCadStore';

export function generateTubeGCode(state: CadState): string {
  const {
    length,
    outerRadius,
    profileType,
    wallThickness,
    rectWidth,
    cuts,
    materialId,
    laserPowerKW,
    assistGas,
  } = state;

  const material = MATERIALS[materialId] || MATERIALS.steel_304;
  const outerDiameter = profileType === 'round' ? outerRadius * 2 : rectWidth;
  const circumference = Math.PI * outerDiameter;
  const enabledCuts = cuts.filter((c) => c.enabled);
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const baseSpeedMPerMin = Math.max(
    0.5,
    ((laserPowerKW * 4.5) / wallThickness ** 0.8) * material.cuttingSpeedFactor
  );
  const feedRateMmPerMin = Math.round(baseSpeedMPerMin * 1000);

  let gcode = `( ==================================================== )\n`;
  gcode += `( ZAHIRI METAL INDUSTRIAL FIBER LASER CNC CODE         )\n`;
  gcode += `( PROGRAM ID : ZAHIRI_FIBERCUT_${Math.floor(1000 + Math.random() * 9000)} )\n`;
  gcode += `( GENERATED  : ${timestamp}                              )\n`;
  gcode += `( SYSTEM     : ZAHIRI FIBERCUT STUDIO v1.0 ISO-6983     )\n`;
  gcode += `( ==================================================== )\n`;
  gcode += `( MATERIAL   : ${material.name.toUpperCase()} )\n`;
  gcode += `( DENSITY    : ${material.density} g/cm3 )\n`;
  gcode += `( PROFILE    : ${profileType.toUpperCase()} TUBE ${length}mm x Ø${outerDiameter}mm )\n`;
  gcode += `( WALL THICK : ${wallThickness} mm )\n`;
  gcode += `( ASSIST GAS : ${assistGas.toUpperCase()} )\n`;
  gcode += `( LASER POWER: ${laserPowerKW} kW FIBER )\n`;
  gcode += `( CUT FEED   : ${feedRateMmPerMin} mm/min )\n`;
  gcode += `( TOTAL CUTS : ${enabledCuts.length} ACTIVE FEATURES )\n`;
  gcode += `( ==================================================== )\n\n`;

  gcode += `G21 (Units: Millimeters)\n`;
  gcode += `G90 (Absolute Positioning Mode)\n`;
  gcode += `G92 Z0 A0 (Set Rotary & Axis Zero Reference)\n`;
  gcode += `M08 (Assist Gas ${assistGas.toUpperCase()} Solenoid ON)\n\n`;
  gcode += `( --- ROTARY TUBE HOMING --- )\n`;
  gcode += `G0 Z0.000 A0.000\n\n`;

  enabledCuts.forEach((cut, index) => {
    gcode += `( --- FEATURE ${index + 1}: ${cut.name.toUpperCase()} --- )\n`;
    const zCenter = cut.positionZ;
    const aCenter = cut.polarAngle;

    if (cut.type === 'hole') {
      const radius = cut.radius;
      const angleDeltaDeg = ((radius / circumference) * 360).toFixed(3);

      gcode += `( CIRCULAR HOLE DIA ${radius * 2}mm AT Z=${zCenter}mm, A=${aCenter}° )\n`;
      gcode += `G0 Z${zCenter.toFixed(3)} A${aCenter.toFixed(3)} (Rapid to Piercing Center)\n`;
      gcode += `M03 S${(laserPowerKW * 1000).toFixed(0)} (Laser Piercing ON)\n`;
      gcode += `G4 P200 (Dwell 200ms for Pierce)\n`;
      gcode += `G1 Z${(zCenter + radius).toFixed(3)} A${aCenter.toFixed(3)} F${feedRateMmPerMin}\n`;
      gcode += `G1 Z${zCenter.toFixed(3)} A${(aCenter + Number(angleDeltaDeg)).toFixed(3)}\n`;
      gcode += `G1 Z${(zCenter - radius).toFixed(3)} A${aCenter.toFixed(3)}\n`;
      gcode += `G1 Z${zCenter.toFixed(3)} A${(aCenter - Number(angleDeltaDeg)).toFixed(3)}\n`;
      gcode += `G1 Z${(zCenter + radius).toFixed(3)} A${aCenter.toFixed(3)}\n`;
      gcode += `M05 (Laser OFF)\n\n`;
    } else if (cut.type === 'slot') {
      const halfL = cut.slotLength / 2;
      const halfWAngle = Number(((cut.slotWidth / 2 / circumference) * 360).toFixed(3));

      gcode += `( RECTANGULAR SLOT ${cut.slotLength}x${cut.slotWidth}mm AT Z=${zCenter}mm, A=${aCenter}° )\n`;
      gcode += `G0 Z${(zCenter - halfL).toFixed(3)} A${(aCenter - halfWAngle).toFixed(3)} (Rapid to Corner)\n`;
      gcode += `M03 S${(laserPowerKW * 1000).toFixed(0)} (Laser ON)\n`;
      gcode += `G4 P200 (Pierce Dwell)\n`;
      gcode += `G1 Z${(zCenter + halfL).toFixed(3)} A${(aCenter - halfWAngle).toFixed(3)} F${feedRateMmPerMin}\n`;
      gcode += `G1 Z${(zCenter + halfL).toFixed(3)} A${(aCenter + halfWAngle).toFixed(3)}\n`;
      gcode += `G1 Z${(zCenter - halfL).toFixed(3)} A${(aCenter + halfWAngle).toFixed(3)}\n`;
      gcode += `G1 Z${(zCenter - halfL).toFixed(3)} A${(aCenter - halfWAngle).toFixed(3)}\n`;
      gcode += `M05 (Laser OFF)\n\n`;
    } else if (cut.type === 'mitre_start' || cut.type === 'mitre_end') {
      const zPos = cut.type === 'mitre_start' ? 0 : length;
      gcode += `( MITRE BEVEL CUT ${cut.mitreAngle}° AT Z=${zPos}mm )\n`;
      gcode += `G0 Z${zPos.toFixed(3)} A0.000\n`;
      gcode += `M03 S${(laserPowerKW * 1000).toFixed(0)}\n`;
      gcode += `G1 Z${zPos.toFixed(3)} A360.000 F${feedRateMmPerMin} (360 Deg Rotary Bevel Cut)\n`;
      gcode += `M05 (Laser OFF)\n\n`;
    }
  });

  gcode += `( --- PROGRAM END & RETRACT --- )\n`;
  gcode += `M05 (Ensure Laser OFF)\n`;
  gcode += `M09 (Assist Gas OFF)\n`;
  gcode += `G0 Z0.000 A0.000 (Return to Machine Home)\n`;
  gcode += `M30 (End of Program)\n`;

  return gcode;
}
