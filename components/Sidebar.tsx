
import React from 'react';
import { Bot, Zap, Layers, BarChart, FileText, Network, Layout, Undo2, Redo2, Printer, Globe } from 'lucide-react';
import { Step } from '../types';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportPDF: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentStep, 
  setCurrentStep, 
  undo, 
  redo, 
  canUndo, 
  canRedo,
  onExportPDF
}) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('zh') ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const steps = [
    { id: Step.INPUT, label: t('steps.input'), icon: Zap },
    { id: Step.BREAKDOWN, label: t('steps.breakdown'), icon: Layers },
    { id: Step.ANALYSIS, label: t('steps.analysis'), icon: BarChart },
    { id: Step.DIAGRAMS, label: t('steps.diagrams'), icon: FileText },
    { id: Step.MINDMAP, label: t('steps.mindmap'), icon: Network },
    { id: Step.PROTOTYPE, label: t('steps.prototype'), icon: Layout },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10 shrink-0 print:hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Bot size={24} />
          <span>{t('app_title')}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{t('app_subtitle')}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              {step.label}
            </button>
          );
        })}
      </nav>

      {/* Undo/Redo & Export Controls */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex gap-2 justify-center">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={`${t('common.undo')} (Ctrl+Z)`}
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={`${t('common.redo')} (Ctrl+Y)`}
          >
            <Redo2 size={20} />
          </button>
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Switch Language"
          >
            <Globe size={20} />
          </button>
        </div>
        
        <button 
          onClick={onExportPDF}
          className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 flex items-center justify-center gap-2"
        >
          <Printer size={16} /> {t('common.export_pdf')}
        </button>

        <div className="text-xs text-slate-400 text-center pt-2">
          {t('common.powered_by')}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
