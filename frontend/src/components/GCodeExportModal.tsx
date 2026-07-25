import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCadStore } from '../store/useCadStore';
import { generateTubeGCode } from '../utils/GCodeGenerator';
import {
  FileCode,
  Download,
  Copy,
  Check,
  X,
  Terminal,
} from 'lucide-react';

interface GCodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GCodeExportModal: React.FC<GCodeExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const state = useCadStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gcodeText = generateTubeGCode(state);
  const outerDiameter = state.profileType === 'round' ? state.outerRadius * 2 : state.rectWidth;
  const fileName = `Zahiri_Tube_${state.length}x${outerDiameter}mm.nc`;

  const handleCopy = () => {
    navigator.clipboard.writeText(gcodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([gcodeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[99999] p-4 select-none animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-[100000]">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                {t('gcode.title')}
                <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30">
                  ISO 6983 / DIN 66025
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono">
                {fileName} ({state.cuts.filter((c) => c.enabled).length} {t('telemetry.csgEvaluated')})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-zinc-950 p-4 font-mono text-xs text-amber-300/90 leading-relaxed border-b border-zinc-800">
          <pre className="whitespace-pre-wrap">
            {gcodeText.split('\n').map((line, idx) => (
              <div key={idx} className="flex hover:bg-zinc-900/60 rounded px-1">
                <span className="w-10 text-zinc-600 select-none text-right pr-4 text-[10px]">
                  {idx + 1}
                </span>
                <span
                  className={
                    line.startsWith('(')
                      ? 'text-zinc-500 italic'
                      : line.startsWith('M03') || line.startsWith('M05')
                      ? 'text-red-400 font-bold'
                      : line.startsWith('G1')
                      ? 'text-amber-300 font-semibold'
                      : 'text-zinc-200'
                  }
                >
                  {line}
                </span>
              </div>
            ))}
          </pre>
        </div>

        <div className="p-3 bg-zinc-900 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{t('gcode.format')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-medium transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{t('gcode.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('gcode.copy')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded shadow-lg shadow-amber-500/10 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{t('gcode.download')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
