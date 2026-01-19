// ... (imports)
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PrdState } from '../../types';
import MermaidRenderer from '../MermaidRenderer';
import VisualMindMapEditor from '../VisualMindMapEditor';
import RefinementPanel from '../RefinementPanel';
import { useTranslation } from 'react-i18next';

interface MindMapStepProps {
  data: PrdState;
  setData: (data: (prev: PrdState) => PrdState) => void;
  onRefine: () => void;
  isRefining: boolean;
  refinementInput: string;
  setRefinementInput: (val: string) => void;
  onNext: () => void;
}

const MindMapStep: React.FC<MindMapStepProps> = ({
  data, setData, onRefine, isRefining, refinementInput, setRefinementInput, onNext
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">{t('mindmap_step.title')}</h2>
        <div className="flex gap-2">
          <button 
            onClick={onNext}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
          >
            {t('mindmap_step.next_btn')} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <RefinementPanel 
        input={refinementInput}
        setInput={setRefinementInput}
        onSend={onRefine}
        isRefining={isRefining}
        placeholder={t('mindmap_step.refine_placeholder')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 overflow-hidden pb-4 min-h-0">
        {/* Visual Editor */}
        <div className="lg:col-span-2 h-full flex flex-col min-h-0 relative z-10 min-w-0">
          <VisualMindMapEditor 
             mermaidCode={data.mindMap}
             onChange={(newCode) => setData((prev) => ({ ...prev, mindMap: newCode }))}
          />
        </div>
        
        {/* Visualizer */}
        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden relative z-0 min-w-0">
          <div className="flex-1 overflow-hidden h-full">
             {data.mindMap ? (
               <MermaidRenderer chart={data.mindMap} />
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 italic bg-white rounded-xl border border-slate-200">
                  {t('mindmap_step.empty_state')}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMapStep;
