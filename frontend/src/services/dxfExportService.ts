import { CadState } from '../store/useCadStore';

export class DxfExportService {
  static exportSheetMetalDxf(state: CadState) {
    const { length, outerRadius, profileType, rectWidth, cuts } = state;
    const outerDiameter = profileType === 'round' ? outerRadius * 2 : rectWidth;
    const circumference = Math.PI * outerDiameter;
    const enabledCuts = cuts.filter((c) => c.enabled);

    let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n`;
    dxf += `0\nSECTION\n2\nTABLES\n0\nENDSEC\n`;
    dxf += `0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n`;
    dxf += `0\nSECTION\n2\nENTITIES\n`;

    // Layer 0: Sheet Outer Boundary Rectangle
    dxf += `0\nLINE\n8\nOUTLINE\n10\n0.0\n20\n0.0\n11\n${length.toFixed(3)}\n21\n0.0\n`;
    dxf += `0\nLINE\n8\nOUTLINE\n10\n${length.toFixed(3)}\n20\n0.0\n11\n${length.toFixed(3)}\n21\n${circumference.toFixed(3)}\n`;
    dxf += `0\nLINE\n8\nOUTLINE\n10\n${length.toFixed(3)}\n20\n${circumference.toFixed(3)}\n11\n0.0\n21\n${circumference.toFixed(3)}\n`;
    dxf += `0\nLINE\n8\nOUTLINE\n10\n0.0\n20\n${circumference.toFixed(3)}\n11\n0.0\n21\n0.0\n`;

    // Centerline (180 deg)
    dxf += `0\nLINE\n8\nCENTERLINE\n10\n0.0\n20\n${(circumference / 2).toFixed(3)}\n11\n${length.toFixed(3)}\n21\n${(circumference / 2).toFixed(3)}\n`;

    // Cut Features Layer: CUTS
    enabledCuts.forEach((cut) => {
      const xCenter = cut.positionZ;
      const yCenter = (cut.polarAngle / 360) * circumference;

      if (cut.type === 'hole') {
        dxf += `0\nCIRCLE\n8\nCUTS\n10\n${xCenter.toFixed(3)}\n20\n${yCenter.toFixed(3)}\n40\n${cut.radius.toFixed(3)}\n`;
      } else if (cut.type === 'slot') {
        const halfL = cut.slotLength / 2;
        const halfW = cut.slotWidth / 2;

        const x1 = (xCenter - halfL).toFixed(3);
        const x2 = (xCenter + halfL).toFixed(3);
        const y1 = (yCenter - halfW).toFixed(3);
        const y2 = (yCenter + halfW).toFixed(3);

        dxf += `0\nLINE\n8\nCUTS\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y1}\n`;
        dxf += `0\nLINE\n8\nCUTS\n10\n${x2}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
        dxf += `0\nLINE\n8\nCUTS\n10\n${x2}\n20\n${y2}\n11\n${x1}\n21\n${y2}\n`;
        dxf += `0\nLINE\n8\nCUTS\n10\n${x1}\n20\n${y2}\n11\n${x1}\n21\n${y1}\n`;
      } else if (cut.type === 'mitre_start' || cut.type === 'mitre_end') {
        dxf += `0\nLINE\n8\nCUTS\n10\n${xCenter.toFixed(3)}\n20\n0.0\n11\n${xCenter.toFixed(3)}\n21\n${circumference.toFixed(3)}\n`;
      }
    });

    dxf += `0\nENDSEC\n0\nEOF\n`;

    const blob = new Blob([dxf], { type: 'application/dxf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Zahiri_SheetMetal_Unroll_${length}x${outerDiameter}mm.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
