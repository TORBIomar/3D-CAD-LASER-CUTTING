import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCadStore, MATERIALS } from '../../store/useCadStore';
import { Ruler, ZoomIn, ZoomOut } from 'lucide-react';

export const Blueprint2DView: React.FC = () => {
  const { t } = useTranslation();
  const {
    length,
    outerRadius,
    profileType,
    rectWidth,
    cuts,
    selectedCutId,
    selectCutFeature,
    materialId,
  } = useCadStore();

  const [zoom, setZoom] = useState(1);
  const material = MATERIALS[materialId];

  const outerDiameter = profileType === 'round' ? outerRadius * 2 : rectWidth;
  const circumference = Math.PI * outerDiameter;

  const svgWidth = 1000;
  const marginX = 80;
  const marginY = 60;
  const printableWidth = svgWidth - marginX * 2;

  const scaleX = printableWidth / length;
  const sheetHeightPx = circumference * scaleX;
  const svgHeight = Math.max(450, sheetHeightPx + marginY * 2);

  const enabledCuts = useMemo(() => cuts.filter((c) => c.enabled), [cuts]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col select-none overflow-hidden cad-grid-pattern">
      <div className="h-9 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 font-mono text-xs">
            {t('blueprint.header')}
          </span>
          <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30">
            DIN 6935 FLAT PATTERN
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="text-slate-400">
            {t('blueprint.sheet')}: <span className="text-amber-400 font-bold">{length}mm</span> ×{' '}
            <span className="text-cyan-400 font-bold">{circumference.toFixed(1)}mm</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-0.5 hover:text-cyan-400 transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] w-8 text-center text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
              className="p-0.5 hover:text-cyan-400 transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#080d1a]">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 ease-out shadow-2xl rounded border border-cyan-500/30 bg-[#0b1329]"
        >
          <svg width={svgWidth} height={svgHeight} className="font-mono text-[10px]">
            <defs>
              <pattern
                id="blueprint-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#blueprint-grid)" />

            <g transform={`translate(${marginX}, ${marginY})`}>
              <rect
                x={0}
                y={0}
                width={printableWidth}
                height={sheetHeightPx}
                fill="#0f172a"
                fillOpacity="0.8"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              <line
                x1={0}
                y1={sheetHeightPx / 2}
                x2={printableWidth}
                y2={sheetHeightPx / 2}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="6,4"
              />
              <text x={printableWidth + 6} y={sheetHeightPx / 2 + 4} fill="#f59e0b" fontSize="9">
                CL (180°)
              </text>

              <text x={-25} y={12} fill="#38bdf8" fontSize="9">
                0°
              </text>
              <text x={-35} y={sheetHeightPx} fill="#38bdf8" fontSize="9">
                360°
              </text>

              <g transform={`translate(0, ${-20})`}>
                <line x1={0} y1={0} x2={printableWidth} y2={0} stroke="#f59e0b" strokeWidth="1.5" />
                <line x1={0} y1={-5} x2={0} y2={5} stroke="#f59e0b" strokeWidth="1.5" />
                <line x1={printableWidth} y1={-5} x2={printableWidth} y2={5} stroke="#f59e0b" strokeWidth="1.5" />
                <text
                  x={printableWidth / 2}
                  y={-6}
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontWeight="bold"
                  fontSize="11"
                >
                  {t('blueprint.length')}: {length} mm
                </text>
              </g>

              <g transform={`translate(${-25}, 0)`}>
                <line x1={0} y1={0} x2={0} y2={sheetHeightPx} stroke="#06b6d4" strokeWidth="1.5" />
                <line x1={-5} y1={0} x2={5} y2={0} stroke="#06b6d4" strokeWidth="1.5" />
                <line x1={-5} y1={sheetHeightPx} x2={5} y2={sheetHeightPx} stroke="#06b6d4" strokeWidth="1.5" />
                <text
                  x={-8}
                  y={sheetHeightPx / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, ${-8}, ${sheetHeightPx / 2})`}
                  fill="#06b6d4"
                  fontWeight="bold"
                  fontSize="11"
                >
                  {t('blueprint.circumference')}: {circumference.toFixed(1)} mm
                </text>
              </g>

              {enabledCuts.map((cut, idx) => {
                const cutPxX = cut.positionZ * scaleX;
                const cutPxY = (cut.polarAngle / 360) * sheetHeightPx;
                const isSelected = cut.id === selectedCutId;

                return (
                  <g
                    key={cut.id}
                    onClick={() => selectCutFeature(cut.id)}
                    className="cursor-pointer group"
                  >
                    <circle cx={cutPxX} cy={cutPxY} r={3} fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                    <line x1={cutPxX - 8} y1={cutPxY} x2={cutPxX + 8} y2={cutPxY} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1={cutPxX} y1={cutPxY - 8} x2={cutPxX} y2={cutPxY + 8} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2,2" />

                    {cut.type === 'hole' && (
                      <circle
                        cx={cutPxX}
                        cy={cutPxY}
                        r={cut.radius * scaleX}
                        fill={isSelected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.15)'}
                        stroke={isSelected ? '#f59e0b' : '#38bdf8'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                      />
                    )}

                    {cut.type === 'slot' && (
                      <rect
                        x={cutPxX - (cut.slotLength / 2) * scaleX}
                        y={cutPxY - (cut.slotWidth / 2) * scaleX}
                        width={cut.slotLength * scaleX}
                        height={cut.slotWidth * scaleX}
                        rx={cut.slotWidth * 0.4 * scaleX}
                        fill={isSelected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.15)'}
                        stroke={isSelected ? '#f59e0b' : '#38bdf8'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                      />
                    )}

                    {(cut.type === 'mitre_start' || cut.type === 'mitre_end') && (
                      <line x1={cutPxX} y1={0} x2={cutPxX} y2={sheetHeightPx} stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" />
                    )}

                    <g transform={`translate(${cutPxX + 10}, ${cutPxY - 10})`}>
                      <rect x={0} y={-12} width={75} height={16} rx={3} fill="#09090b" stroke={isSelected ? '#f59e0b' : '#38bdf8'} strokeWidth="1" />
                      <text x={4} y={0} fill={isSelected ? '#f59e0b' : '#f1f5f9'} fontSize="9" fontWeight="bold">
                        #{idx + 1} {t(`cutList.cutTypes.${cut.type}`).toUpperCase()}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> {t('blueprint.legendCut')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {t('blueprint.legendPierce')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400" /> {t('blueprint.legendCenter')}
          </span>
        </div>

        <div className="text-slate-300">
          MATERIAL: <span className="text-amber-400">{material.name}</span> | ISO 6983 FLAT PATTERN
        </div>
      </div>
    </div>
  );
};
