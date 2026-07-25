import { CutFeature, CadState } from '../store/useCadStore';

export interface FeasibilityIssue {
  cutId: string;
  cutName: string;
  type: 'edge_proximity' | 'overlap' | 'wall_thickness';
  severity: 'warning' | 'error';
  message: string;
}

export function checkManufacturingFeasibility(state: CadState): FeasibilityIssue[] {
  const { cuts, length, outerRadius, wallThickness } = state;
  const enabledCuts = cuts.filter((c) => c.enabled);
  const issues: FeasibilityIssue[] = [];

  const tubeRadius = outerRadius;

  enabledCuts.forEach((cut) => {
    // 1. Edge Proximity Warning (< 15mm from tube ends)
    const marginStart = cut.positionZ;
    const marginEnd = length - cut.positionZ;

    if (cut.type === 'hole') {
      if (marginStart - cut.radius < 15) {
        issues.push({
          cutId: cut.id,
          cutName: cut.name,
          type: 'edge_proximity',
          severity: 'error',
          message: `Hole is too close to start edge (${(marginStart - cut.radius).toFixed(1)}mm < 15mm minimum).`,
        });
      }
      if (marginEnd - cut.radius < 15) {
        issues.push({
          cutId: cut.id,
          cutName: cut.name,
          type: 'edge_proximity',
          severity: 'error',
          message: `Hole is too close to end edge (${(marginEnd - cut.radius).toFixed(1)}mm < 15mm minimum).`,
        });
      }
    } else if (cut.type === 'slot') {
      const halfL = cut.slotLength / 2;
      if (marginStart - halfL < 15) {
        issues.push({
          cutId: cut.id,
          cutName: cut.name,
          type: 'edge_proximity',
          severity: 'error',
          message: `Slot is too close to start edge (${(marginStart - halfL).toFixed(1)}mm < 15mm).`,
        });
      }
      if (marginEnd - halfL < 15) {
        issues.push({
          cutId: cut.id,
          cutName: cut.name,
          type: 'edge_proximity',
          severity: 'error',
          message: `Slot is too close to end edge (${(marginEnd - halfL).toFixed(1)}mm < 15mm).`,
        });
      }
    }
  });

  // 2. Overlap Checking
  for (let i = 0; i < enabledCuts.length; i++) {
    for (let j = i + 1; j < enabledCuts.length; j++) {
      const c1 = enabledCuts[i];
      const c2 = enabledCuts[j];

      if (c1.type === 'mitre_start' || c1.type === 'mitre_end' || c2.type === 'mitre_start' || c2.type === 'mitre_end') {
        continue;
      }

      const zDistance = Math.abs(c1.positionZ - c2.positionZ);
      const angleDistanceDeg = Math.abs(c1.polarAngle - c2.polarAngle);
      const circumference = Math.PI * (tubeRadius * 2);
      const arcDistanceMm = (angleDistanceDeg / 360) * circumference;

      const r1 = c1.type === 'hole' ? c1.radius : c1.slotLength / 2;
      const r2 = c2.type === 'hole' ? c2.radius : c2.slotLength / 2;
      const minSafeDistance = r1 + r2 + 10; // 10mm clearance

      if (zDistance < minSafeDistance && arcDistanceMm < 20) {
        issues.push({
          cutId: c1.id,
          cutName: `${c1.name} & ${c2.name}`,
          type: 'overlap',
          severity: 'warning',
          message: `Feature distance (${zDistance.toFixed(1)}mm) is below safe clearance (${minSafeDistance}mm).`,
        });
      }
    }
  }

  return issues;
}
