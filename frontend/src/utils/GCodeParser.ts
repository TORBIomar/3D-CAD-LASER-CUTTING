import { CutFeature, CutType, ProfileType } from '../store/useCadStore';

export interface ParsedGCodeResult {
  length: number;
  outerRadius: number;
  wallThickness: number;
  profileType: ProfileType;
  materialId: string;
  cuts: CutFeature[];
}

export function parseGCodeFile(gcodeContent: string): ParsedGCodeResult {
  const lines = gcodeContent.split('\n');
  let length = 1200;
  let outerRadius = 40;
  let wallThickness = 3.5;
  let profileType: ProfileType = 'round';
  let materialId = 'steel_304';
  const cuts: CutFeature[] = [];

  // 1. Header Metadata Parsing
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('(')) {
      const upper = trimmed.toUpperCase();
      if (upper.includes('PROFILE')) {
        if (upper.includes('SQUARE')) profileType = 'square';
        else if (upper.includes('RECT')) profileType = 'rectangular';
        else profileType = 'round';

        const matchLen = upper.match(/(\d+)MM/);
        if (matchLen) length = parseInt(matchLen[1], 10);

        const matchDia = upper.match(/Ø(\d+)/) || upper.match(/DIA\s*(\d+)/);
        if (matchDia) outerRadius = parseInt(matchDia[1], 10) / 2;
      }
      if (upper.includes('WALL THICK')) {
        const matchT = upper.match(/:\s*([\d.]+)/);
        if (matchT) wallThickness = parseFloat(matchT[1]);
      }
      if (upper.includes('STAINLESS')) materialId = 'steel_304';
      if (upper.includes('STRUCTURAL') || upper.includes('S235')) materialId = 'steel_s235';
      if (upper.includes('ALUMINUM')) materialId = 'aluminum_6061';
    }
  });

  // 2. Motion Commands & Feature Extraction
  let currentFeatureType: CutType = 'hole';
  let currentFeatureName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('(') && line.includes('FEATURE')) {
      currentFeatureName = line.replace(/[()]/g, '').trim();
      const upper = line.toUpperCase();
      if (upper.includes('HOLE')) currentFeatureType = 'hole';
      else if (upper.includes('SLOT')) currentFeatureType = 'slot';
      else if (upper.includes('MITRE')) {
        currentFeatureType = upper.includes('START') ? 'mitre_start' : 'mitre_end';
      }
    }

    if (line.startsWith('G0') || line.startsWith('G1')) {
      const matchZ = line.match(/Z([\d.-]+)/);
      const matchA = line.match(/A([\d.-]+)/);

      if (matchZ && matchA) {
        const zVal = Math.abs(parseFloat(matchZ[1]));
        const aVal = Math.abs(parseFloat(matchA[1])) % 360;

        if (zVal > 0 && zVal <= length) {
          const cutId = `parsed-${cuts.length + 1}-${Date.now()}`;
          const exists = cuts.some((c) => Math.abs(c.positionZ - zVal) < 5);

          if (!exists) {
            cuts.push({
              id: cutId,
              name: currentFeatureName || `Cut ${cuts.length + 1} @ ${zVal.toFixed(0)}mm`,
              type: currentFeatureType,
              positionZ: zVal,
              polarAngle: aVal,
              radius: currentFeatureType === 'hole' ? 15 : 10,
              slotLength: 50,
              slotWidth: 20,
              mitreAngle: 45,
              enabled: true,
            });
          }
        }
      }
    }
  }

  // Default fallback cut if none extracted
  if (cuts.length === 0) {
    cuts.push({
      id: `cut-${Date.now()}`,
      name: 'Imported G-Code Feature @ 300mm',
      type: 'hole',
      positionZ: 300,
      polarAngle: 0,
      radius: 15,
      slotLength: 50,
      slotWidth: 20,
      mitreAngle: 45,
      enabled: true,
    });
  }

  return {
    length,
    outerRadius,
    wallThickness,
    profileType,
    materialId,
    cuts,
  };
}
