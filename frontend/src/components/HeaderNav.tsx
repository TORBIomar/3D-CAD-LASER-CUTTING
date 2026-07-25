import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCadStore,
  MATERIALS,
  MaterialId,
  ViewMode,
} from '../store/useCadStore';
import { ProjectService } from '../services/projectService';
import { PdfExportService } from '../services/pdfExportService';
import { DxfExportService } from '../services/dxfExportService';
import { GCodeExportModal } from './GCodeExportModal';
import { ProjectLoadModal } from './ProjectLoadModal';
import {
  Zap,
  RotateCcw,
  Undo,
  Redo,
  FileCode,
  Sparkles,
  Cpu,
  Save,
  Globe,
  FolderOpen,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const { t, i18n } = useTranslation();
  const cadState = useCadStore();
  const {
    materialId,
    setMaterialId,
    viewMode,
    setViewMode,
    resetDefault,
    undo,
    redo,
    undoStack,
    redoStack,
    isLaserAnimating,
    toggleSetting,
  } = cadState;

  const [isGCodeModalOpen, setIsGCodeModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleSaveCad = async () => {
    setExportNotice(i18n.language === 'fr' ? 'Sauvegarde du projet CAD...' : 'Saving CAD project...');
    const result = await ProjectService.saveProject(cadState);
    setExportNotice(result.message);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportPdf = () => {
    setExportNotice(i18n.language === 'fr' ? 'Génération de la fiche PDF...' : 'Generating PDF Data Sheet...');
    PdfExportService.exportTechnicalDataSheet(cadState, i18n.language);
    setTimeout(() => setExportNotice(null), 2500);
  };

  const handleExportDxf = () => {
    setExportNotice(i18n.language === 'fr' ? 'Exportation du fichier 2D DXF...' : 'Exporting 2D DXF Vector File...');
    DxfExportService.exportSheetMetalDxf(cadState);
    setTimeout(() => setExportNotice(null), 2500);
  };

  return (
    <>
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between text-xs text-zinc-300 z-20 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 px-2.5 py-1 rounded">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="font-bold text-zinc-100 tracking-wider text-sm">
              ZAHIRI <span className="text-amber-400">METAL</span>
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-1 rounded border border-amber-500/30">
              {t('app.title')}
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsLoadModalOpen(true)}
              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded transition flex items-center gap-1.5 text-[11px]"
              title="Open Project"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Project</span>
            </button>

            <button
              onClick={handleSaveCad}
              className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded transition flex items-center gap-1 text-[11px]"
            >
              <Save className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t('app.saveCad')}</span>
            </button>

            <div className="h-4 w-px bg-zinc-800 mx-1" />

            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="p-1 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 hover:text-zinc-100 rounded transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-1 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 hover:text-zinc-100 rounded transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetDefault}
              className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded transition flex items-center gap-1 text-[11px]"
              title="Reset scene"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('app.reset')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded px-2 py-1">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-zinc-400">{t('app.material')}:</span>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value as MaterialId)}
              className="bg-transparent text-zinc-100 text-[11px] font-medium outline-none cursor-pointer"
            >
              {Object.values(MATERIALS).map((mat) => (
                <option key={mat.id} value={mat.id} className="bg-zinc-900 text-zinc-100">
                  {mat.name} ({mat.density} g/cm³)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-zinc-950 p-0.5 rounded border border-zinc-800">
            {(['shaded', 'wireframe', 'laser_cut', 'blueprint'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition ${
                  viewMode === mode
                    ? 'bg-zinc-800 text-amber-400 shadow-sm border border-zinc-700 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t(`app.viewModes.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded text-[11px] font-mono flex items-center gap-1.5 transition"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-amber-400 uppercase">{i18n.language}</span>
          </button>

          <button
            onClick={() => toggleSetting('isLaserAnimating')}
            className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1.5 transition ${
              isLaserAnimating
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${
                isLaserAnimating ? 'text-amber-400 animate-pulse' : ''
              }`}
            />
            <span>{t('app.fiberSimulation')}</span>
          </button>

          <button
            onClick={handleExportDxf}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium px-2.5 py-1 rounded text-[11px] transition flex items-center gap-1.5"
            title="Export 2D CAD DXF Vector Drawing"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>DXF Vector</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-medium px-2.5 py-1 rounded text-[11px] transition flex items-center gap-1.5"
            title="Export Engineering PDF Data Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>PDF Spec</span>
          </button>

          <button
            onClick={() => setIsGCodeModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1 rounded text-[11px] transition flex items-center gap-1.5 shadow-md shadow-amber-500/10"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{t('app.exportGCode')}</span>
          </button>
        </div>

        {exportNotice && (
          <div className="absolute top-14 right-4 bg-zinc-900 border border-amber-500/50 text-amber-300 px-3 py-2 rounded shadow-2xl z-50 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{exportNotice}</span>
          </div>
        )}
      </header>

      <GCodeExportModal
        isOpen={isGCodeModalOpen}
        onClose={() => setIsGCodeModalOpen(false)}
      />

      <ProjectLoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
      />
    </>
  );
};
