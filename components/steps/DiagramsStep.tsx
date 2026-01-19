// ... (imports)
import React, { useState } from 'react';
import { ArrowRight, Code, Layout, Maximize2, Minimize2 } from 'lucide-react';
import { PrdState } from '../../types';
import MermaidRenderer from '../MermaidRenderer';
import RefinementPanel from '../RefinementPanel';
import VisualFlowchartEditor from '../VisualFlowchartEditor';
import { useTranslation } from 'react-i18next';

interface DiagramsStepProps {
  data: PrdState;
  setData: (data: (prev: PrdState) => PrdState) => void;
  onRefine: () => void;
  isRefining: boolean;
  refinementInput: string;
  setRefinementInput: (val: string) => void;
  onNext: () => void;
}

const DiagramsStep: React.FC<DiagramsStepProps> = ({
  data, setData, onRefine, isRefining, refinementInput, setRefinementInput, onNext
}) => {
  const { t } = useTranslation();
  const [showCode, setShowCode] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('diagrams_step.title')}</h2>
          <p className="text-slate-500 text-sm">{t('diagrams_step.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCode(!showCode)} 
            className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${showCode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title={t('diagrams_step.toggle_code')}
          >
            {showCode ? <Layout size={16} /> : <Code size={16} />}
            {showCode ? t('diagrams_step.visual') : t('diagrams_step.code')}
          </button>
          <button 
            onClick={onNext}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
          >
            {t('diagrams_step.next_btn')} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <RefinementPanel 
        input={refinementInput}
        setInput={setRefinementInput}
        onSend={onRefine}
        isRefining={isRefining}
        placeholder={t('diagrams_step.refine_placeholder')}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex gap-6 relative">
        
        {/* Editor Side */}
        <div 
          className={`flex flex-col border rounded-xl overflow-hidden shadow-sm border-slate-200 transition-all duration-300 relative z-10 ${
            isMaximized ? 'w-1/2' : 'w-full lg:w-1/3'
          }`}
        >
            {/* Maximize Toggle */}
            <button 
               onClick={() => setIsMaximized(!isMaximized)}
               className="absolute top-2 right-2 z-20 p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:text-blue-600 hover:border-blue-300 shadow-sm"
               title={isMaximized ? t('diagrams_step.restore') : t('diagrams_step.split_screen')}
            >
               {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

           {showCode ? (
             <div className="bg-slate-900 h-full shadow-inner overflow-hidden flex flex-col pt-10">
               <div className="text-slate-400 text-xs mb-2 font-mono px-4">{t('diagrams_step.mermaid_source')}</div>
               <textarea 
                  className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs outline-none resize-none leading-relaxed custom-scroll p-4"
                  value={data.mermaidDiagram}
                  onChange={(e) => setData((prev) => ({...prev, mermaidDiagram: e.target.value}))}
                  spellCheck={false}
                />
             </div>
           ) : (
             <VisualFlowchartEditor 
               mermaidCode={data.mermaidDiagram}
               onChange={(newCode) => setData((prev) => ({ ...prev, mermaidDiagram: newCode }))}
             />
           )}
        </div>
        
        {/* Visualizer Side */}
        <div 
          className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${
            isMaximized ? 'w-1/2' : 'hidden lg:flex lg:w-2/3'
          }`}
        >
          <div className="flex-1 overflow-hidden h-full rounded-xl border border-slate-200 shadow-sm bg-slate-50">
            {data.mermaidDiagram ? (
              <MermaidRenderer chart={data.mermaidDiagram} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                  {t('diagrams_step.empty_state')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramsStep;
