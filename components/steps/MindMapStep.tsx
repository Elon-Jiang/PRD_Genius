
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PrdState } from '../../types';
import MermaidRenderer from '../MermaidRenderer';
import VisualMindMapEditor from '../VisualMindMapEditor';
import RefinementPanel from '../RefinementPanel';

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
  return (
    <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">产品思维导图</h2>
        <div className="flex gap-2">
          <button 
            onClick={onNext}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
          >
            下一步：原型设计 <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <RefinementPanel 
        input={refinementInput}
        setInput={setRefinementInput}
        onSend={onRefine}
        isRefining={isRefining}
        placeholder="例如：'展开功能模块的细节' 或 '增加一个新的分支'..."
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
                  生成导图后在此预览。
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMapStep;
