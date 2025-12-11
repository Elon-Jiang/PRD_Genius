
import React from 'react';
import { ArrowRight, Target, Plus, ShieldAlert, Sword, Trash2 } from 'lucide-react';
import { PrdState, Competitor } from '../../types';
import RefinementPanel from '../RefinementPanel';

interface AnalysisStepProps {
  data: PrdState;
  setData: (data: (prev: PrdState) => PrdState) => void;
  onRefine: () => void;
  isRefining: boolean;
  refinementInput: string;
  setRefinementInput: (val: string) => void;
  onNext: () => void;
}

const AnalysisStep: React.FC<AnalysisStepProps> = ({
  data, setData, onRefine, isRefining, refinementInput, setRefinementInput, onNext
}) => {
  
  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    setData((prev) => ({
      ...prev,
      competitorAnalysis: {
        ...prev.competitorAnalysis,
        competitors: prev.competitorAnalysis.competitors.map(c => 
          c.id === id ? { ...c, [field]: value } : c
        )
      }
    }));
  };

  const updateAnalysisSummary = (value: string) => {
    setData((prev) => ({
      ...prev,
      competitorAnalysis: {
        ...prev.competitorAnalysis,
        summary: value
      }
    }));
  };

  const handleAddCompetitor = () => {
    setData((prev) => ({
      ...prev,
      competitorAnalysis: {
        ...prev.competitorAnalysis,
        competitors: [...prev.competitorAnalysis.competitors, {
          id: Date.now().toString(),
          name: '新竞品',
          coreAdvantage: '',
          mainDisadvantage: '',
          overlap: 'Medium',
          ourAdvantage: ''
        }]
      }
    }));
  };

  const handleDeleteCompetitor = (id: string) => {
    setData((prev) => ({
      ...prev,
      competitorAnalysis: {
        ...prev.competitorAnalysis,
        competitors: prev.competitorAnalysis.competitors.filter(c => c.id !== id)
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">竞品分析</h2>
           <p className="text-slate-500 text-sm">市场竞争格局与差异化策略。</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddCompetitor} 
            className="px-4 py-2 text-primary border border-primary/20 bg-primary/5 rounded-lg text-sm font-medium hover:bg-primary/10 flex items-center gap-2"
          >
            <Plus size={16} /> 新增竞品
          </button>
          <button 
            onClick={onNext}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
          >
            下一步：流程图 <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pb-12">
        <RefinementPanel 
          input={refinementInput}
          setInput={setRefinementInput}
          onSend={onRefine}
          isRefining={isRefining}
          placeholder="例如：'添加一个海外竞品' 或 '详细分析价格劣势'..."
        />
        
        {/* Summary Section */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Target className="text-blue-600" size={20} />
            核心差异化总结
          </h3>
          <textarea 
            className="w-full text-slate-600 bg-slate-50 p-4 rounded-lg border-transparent focus:border-blue-200 focus:ring-0 resize-none text-base leading-relaxed h-32"
            value={data.competitorAnalysis.summary}
            onChange={(e) => updateAnalysisSummary(e.target.value)}
            placeholder="总结我们的产品如何脱颖而出..."
          />
        </section>

        {/* Competitors Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.competitorAnalysis.competitors.length > 0 ? (
            data.competitorAnalysis.competitors.map((competitor) => (
              <div key={competitor.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden relative group">
                {/* Delete Button */}
                <button 
                  onClick={() => handleDeleteCompetitor(competitor.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 p-1 rounded-full shadow-sm"
                  title="删除竞品"
                >
                  <Trash2 size={16} />
                </button>

                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center pr-10">
                   <input 
                      className="font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 text-lg w-full"
                      value={competitor.name}
                      onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                      placeholder="竞品名称"
                    />
                    <div className="shrink-0 ml-2">
                      <select
                        value={competitor.overlap}
                        onChange={(e) => updateCompetitor(competitor.id, 'overlap', e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded uppercase border-none cursor-pointer ${
                          competitor.overlap === 'High' || competitor.overlap === '高' ? 'bg-red-100 text-red-700' :
                          competitor.overlap === 'Medium' || competitor.overlap === '中' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}
                      >
                         <option value="High">高重合</option>
                         <option value="Medium">中重合</option>
                         <option value="Low">低重合</option>
                      </select>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-4 flex-1">
                   {/* Pros */}
                   <div>
                     <label className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1 block flex items-center gap-1">
                       <ArrowRight size={12} className="rotate-[-45deg]" /> 核心优势
                     </label>
                     <textarea 
                        className="w-full text-sm text-slate-600 bg-transparent border border-slate-100 rounded p-2 focus:border-green-200 focus:ring-0 resize-none"
                        value={competitor.coreAdvantage}
                        onChange={(e) => updateCompetitor(competitor.id, 'coreAdvantage', e.target.value)}
                        rows={3}
                      />
                   </div>

                   {/* Cons */}
                   <div>
                     <label className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1 block flex items-center gap-1">
                       <ShieldAlert size={12} /> 主要劣势
                     </label>
                     <textarea 
                        className="w-full text-sm text-slate-600 bg-transparent border border-slate-100 rounded p-2 focus:border-red-200 focus:ring-0 resize-none"
                        value={competitor.mainDisadvantage}
                        onChange={(e) => updateCompetitor(competitor.id, 'mainDisadvantage', e.target.value)}
                        rows={3}
                      />
                   </div>

                   {/* Strategy */}
                   <div className="pt-2 border-t border-slate-50">
                     <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1 block flex items-center gap-1">
                       <Sword size={12} /> 胜出策略
                     </label>
                     <textarea 
                        className="w-full text-sm text-slate-800 font-medium bg-blue-50/50 border border-blue-100 rounded p-2 focus:border-blue-300 focus:ring-0 resize-none"
                        value={competitor.ourAdvantage}
                        onChange={(e) => updateCompetitor(competitor.id, 'ourAdvantage', e.target.value)}
                        rows={3}
                      />
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full h-32 flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
               暂无竞品分析数据，请点击生成。
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalysisStep;
