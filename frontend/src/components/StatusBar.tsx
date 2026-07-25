import React from 'react';
import { useCadStore, MATERIALS } from '../store/useCadStore';
import { Grid3X3, Compass, Ruler, Cpu } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    showGrid,
    showAxes,
    showDimensions,
    toggleSetting,
    materialId,
    length,
    outerRadius,
  } = useCadStore();

  const activeMaterial = MATERIALS[materialId];

  return (
    <footer className="h-7 bg-zinc-950 border-t border-zinc-800 px-3 flex items-center justify-between text-[11px] text-zinc-400 z-20 select-none font-mono">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleSetting('showGrid')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition ${
              showGrid
                ? 'bg-zinc-800 text-amber-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid3X3 className="w-3 h-3" />
            <span>Grid</span>
          </button>

          <button
            onClick={() => toggleSetting('showAxes')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition ${
              showAxes
                ? 'bg-zinc-800 text-cyan-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Gizmo</span>
          </button>

          <button
            onClick={() => toggleSetting('showDimensions')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition ${
              showDimensions
                ? 'bg-zinc-800 text-emerald-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Dims</span>
          </button>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div className="text-zinc-400 text-[10px] flex items-center gap-2">
          <span>TUBE: {length}mm × Ø{outerRadius * 2}mm</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-zinc-400">
        <span className="flex items-center gap-1 text-amber-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          WebGL2 High-Perf Engine
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Cpu className="w-3 h-3 text-zinc-500" />
          <span>{activeMaterial.name}</span>
        </div>
        <span className="text-emerald-400 font-bold">60 FPS</span>
      </div>
    </footer>
  );
};
