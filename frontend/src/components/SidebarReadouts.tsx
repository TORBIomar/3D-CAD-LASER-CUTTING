import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCadStore, MATERIALS } from '../store/useCadStore';
import { checkManufacturingFeasibility } from '../utils/collisionChecker';
import {
  Weight,
  Box,
  Timer,
  Flame,
  Activity,
  Gauge,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Scissors,
} from 'lucide-react';

export const SidebarReadouts: React.FC = () => {
  const { t } = useTranslation();
  const cadState = useCadStore();
  const {
    profileType,
    length,
    outerRadius,
    wallThickness,
    rectWidth,
    rectHeight,
    cuts,
    materialId,
    laserPowerKW,
  } = cadState;

  const materialSpec = MATERIALS[materialId] || MATERIALS.steel_304;

  const feasibilityIssues = useMemo(() => checkManufacturingFeasibility(cadState), [cadState]);

  const telemetry = useMemo(() => {
    const lCm = length / 10;
    let crossSectionAreaCm2 = 0;

    if (profileType === 'round') {
      const rOuterCm = outerRadius / 10;
      const rInnerCm = Math.max(0, rOuterCm - wallThickness / 10);
      crossSectionAreaCm2 = Math.PI * (rOuterCm ** 2 - rInnerCm ** 2);
    } else {
      const wCm = (profileType === 'square' ? outerRadius * 2 : rectWidth) / 10;
      const hCm = (profileType === 'square' ? outerRadius * 2 : rectHeight) / 10;
      const tCm = wallThickness / 10;
      const innerWCm = Math.max(0, wCm - 2 * tCm);
      const innerHCm = Math.max(0, hCm - 2 * tCm);
      crossSectionAreaCm2 = wCm * hCm - innerWCm * innerHCm;
    }

    let volumeCm3 = crossSectionAreaCm2 * lCm;
    const enabledCuts = cuts.filter((c) => c.enabled);
    let totalCutPerimeterMm = 0;

    enabledCuts.forEach((cut) => {
      if (cut.type === 'hole') {
        const cutAreaCm2 = Math.PI * (cut.radius / 10) ** 2;
        volumeCm3 -= cutAreaCm2 * (wallThickness / 10);
        totalCutPerimeterMm += Math.PI * (cut.radius * 2);
      } else if (cut.type === 'slot') {
        const slotAreaCm2 = (cut.slotWidth / 10) * (cut.slotLength / 10);
        volumeCm3 -= slotAreaCm2 * (wallThickness / 10);
        totalCutPerimeterMm += 2 * cut.slotLength + 2 * cut.slotWidth;
      } else if (cut.type === 'mitre_start' || cut.type === 'mitre_end') {
        totalCutPerimeterMm += (outerRadius * 2) * Math.SQRT2;
      }
    });

    volumeCm3 = Math.max(0.1, volumeCm3);
    const massKg = (volumeCm3 * materialSpec.density) / 1000;

    const baseSpeedMPerMin = Math.max(
      0.5,
      ((laserPowerKW * 4.5) / wallThickness ** 0.8) * materialSpec.cuttingSpeedFactor
    );
    const speedMmPerSec = (baseSpeedMPerMin * 1000) / 60;

    const cutTimeSec =
      totalCutPerimeterMm > 0
        ? totalCutPerimeterMm / speedMmPerSec + enabledCuts.length * 1.2
        : 0;

    return {
      volumeCm3: volumeCm3.toFixed(1),
      massKg: massKg.toFixed(2),
      crossSectionAreaMm2: (crossSectionAreaCm2 * 100).toFixed(0),
      totalCutPerimeterMm: totalCutPerimeterMm.toFixed(1),
      cuttingSpeedMPerMin: baseSpeedMPerMin.toFixed(2),
      cutTimeSec: cutTimeSec.toFixed(1),
      activeCutCount: enabledCuts.length,
    };
  }, [
    profileType,
    length,
    outerRadius,
    wallThickness,
    rectWidth,
    rectHeight,
    cuts,
    materialSpec,
    laserPowerKW,
  ]);

  return (
    <aside className="w-72 bg-zinc-900/95 border-l border-zinc-800 flex flex-col h-[calc(100vh-3rem-1.75rem)] z-10 select-none overflow-y-auto text-xs text-zinc-300">
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-zinc-100 text-xs uppercase tracking-wider">
            {t('telemetry.title')}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">LIVE CAD</span>
      </div>

      <div className="p-3 space-y-4">
        <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {t('telemetry.physicalProps')}
            </span>
            <Box className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800/60">
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Weight className="w-3 h-3 text-amber-400" />
                <span>{t('telemetry.netWeight')}</span>
              </div>
              <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                {telemetry.massKg} <span className="text-xs font-normal text-zinc-400">kg</span>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800/60">
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Box className="w-3 h-3 text-cyan-400" />
                <span>{t('telemetry.volume')}</span>
              </div>
              <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                {telemetry.volumeCm3} <span className="text-xs font-normal text-zinc-400">cm³</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] pt-1 text-zinc-400">
            <span>{t('telemetry.metalDensity')}:</span>
            <span className="font-mono text-zinc-200">{materialSpec.density} g/cm³</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-zinc-400">
            <span>{t('telemetry.crossSection')}:</span>
            <span className="font-mono text-zinc-200">{telemetry.crossSectionAreaMm2} mm²</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {t('telemetry.totalCycle')} ({telemetry.activeCutCount})
            </span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-2.5 rounded border border-amber-500/30">
            <div className="text-[10px] text-amber-300/80 flex items-center justify-between">
              <span>{t('telemetry.estCycleTime')}</span>
              <Timer className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {telemetry.cutTimeSec} <span className="text-xs font-normal text-amber-200">sec / part</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Scissors className="w-3 h-3 text-zinc-500" />
                <span>{t('telemetry.totalCutPath')}:</span>
              </span>
              <span className="font-mono text-amber-300">{telemetry.totalCutPerimeterMm} mm</span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-zinc-500" />
                <span>{t('telemetry.cuttingSpeed')}:</span>
              </span>
              <span className="font-mono text-cyan-400">{telemetry.cuttingSpeedMPerMin} m/min</span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Wind className="w-3 h-3 text-zinc-500" />
                <span>{t('telemetry.assistGas')}:</span>
              </span>
              <span className="font-mono text-zinc-200 uppercase font-semibold">
                {materialSpec.gasRecommended}
              </span>
            </div>
          </div>
        </div>

        {/* Manufacturing Feasibility & Collision Guard Alert Card */}
        {feasibilityIssues.length > 0 ? (
          <div className="bg-red-500/10 border border-red-500/40 p-2.5 rounded text-[10px] space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>FEASIBILITY WARNING ({feasibilityIssues.length})</span>
            </div>
            {feasibilityIssues.map((issue, idx) => (
              <div key={idx} className="text-zinc-300 font-mono text-[9.5px]">
                • <span className="text-red-300 font-semibold">{issue.cutName}</span>: {issue.message}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-950 p-2.5 rounded border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[10px]">
              <div className="font-bold text-emerald-300">CAD Collision Guard Active</div>
              <div className="text-zinc-400">All {telemetry.activeCutCount} cuts feasible for laser cutting</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
