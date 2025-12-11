
import React, { useState } from 'react';
import { ArrowRight, Code, Layout, Maximize2, Minimize2 } from 'lucide-react';
import { PrdState } from '../../types';
import MermaidRenderer from '../MermaidRenderer';
import RefinementPanel from '../RefinementPanel';
import VisualFlowchartEditor from '../VisualFlowchartEditor';

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
  const [showCode, setShowCode] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">业务流程图</h2>
          <p className="text-slate-500 text-sm">定义用户交互流程与系统逻辑。</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCode(!showCode)} 
            className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${showCode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title="切换代码模式"
          >
            {showCode ? <Layout size={16} /> : <Code size={16} />}
            {showCode ? '可视化' : '代码'}
          </button>
          <button 
            onClick={onNext}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
          >
            下一步：思维导图 <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <RefinementPanel 
        input={refinementInput}
        setInput={setRefinementInput}
        onSend={onRefine}
        isRefining={isRefining}
        placeholder="例如：'把流程改为从左到右' 或 '添加一个管理员审核节点'..."
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
               title={isMaximized ? "恢复" : "分屏编辑"}
            >
               {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

           {showCode ? (
             <div className="bg-slate-900 h-full shadow-inner overflow-hidden flex flex-col pt-10">
               <div className="text-slate-400 text-xs mb-2 font-mono px-4">Mermaid Source</div>
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
                  生成图表后在此预览。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramsStep;
