
import React from 'react';
import { Bot, Zap, Layers, BarChart, FileText, Network, Layout, Undo2, Redo2, Printer } from 'lucide-react';
import { Step } from '../types';

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
  const steps = [
    { id: Step.INPUT, label: '产品愿景', icon: Zap },
    { id: Step.BREAKDOWN, label: '需求拆解', icon: Layers },
    { id: Step.ANALYSIS, label: '竞品分析', icon: BarChart },
    { id: Step.DIAGRAMS, label: '流程图', icon: FileText },
    { id: Step.MINDMAP, label: '思维导图', icon: Network },
    { id: Step.PROTOTYPE, label: 'HTML 原型', icon: Layout },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10 shrink-0 print:hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Bot size={24} />
          <span>PRD Genius</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">AI 产品经理助手</p>
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
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 size={20} />
          </button>
        </div>
        
        <button 
          onClick={onExportPDF}
          className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 flex items-center justify-center gap-2"
        >
          <Printer size={16} /> 导出 PDF
        </button>

        <div className="text-xs text-slate-400 text-center pt-2">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
