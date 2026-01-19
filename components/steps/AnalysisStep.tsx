// ... (imports)
import React from 'react';
import { ArrowRight, Target, Plus, ShieldAlert, Sword, Trash2 } from 'lucide-react';
import { PrdState, Competitor } from '../../types';
import RefinementPanel from '../RefinementPanel';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
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
          name: 'New Competitor',
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
           <h2 className="text-2xl font-bold text-slate-900">{t('analysis_step.title')}</h2>
           <p className="text-slate-500 text-sm">{t('analysis_step.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddCompetitor} 
            className="px-4 py-2 text-primary border border-primary/20 bg-primary/5 rounded-lg text-sm font-medium hover:bg-primary/10 flex items-center gap-2"
          >
            <Plus size={16} /> {t('analysis_step.add_competitor')}
          </button>
          <button 
            onClick={onNext}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
          >
            {t('analysis_step.next_btn')} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pb-12">
        <RefinementPanel 
          input={refinementInput}
          setInput={setRefinementInput}
          onSend={onRefine}
          isRefining={isRefining}
          placeholder={t('analysis_step.refine_placeholder')}
        />
        
        {/* Summary Section */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Target className="text-blue-600" size={20} />
            {t('analysis_step.summary_title')}
          </h3>
          <textarea 
            className="w-full text-slate-600 bg-slate-50 p-4 rounded-lg border-transparent focus:border-blue-200 focus:ring-0 resize-none text-base leading-relaxed h-32"
            value={data.competitorAnalysis.summary}
            onChange={(e) => updateAnalysisSummary(e.target.value)}
            placeholder={t('analysis_step.summary_placeholder')}
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
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>

                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center pr-10">
                   <input 
                      className="font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 text-lg w-full"
                      value={competitor.name}
                      onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                      placeholder={t('analysis_step.competitor_name')}
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
                         <option value="High">{t('analysis_step.overlap_high')}</option>
                         <option value="Medium">{t('analysis_step.overlap_medium')}</option>
                         <option value="Low">{t('analysis_step.overlap_low')}</option>
                      </select>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-4 flex-1">
                   {/* Pros */}
                   <div>
                     <label className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1 block flex items-center gap-1">
                       <ArrowRight size={12} className="rotate-[-45deg]" /> {t('analysis_step.core_advantage')}
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
                       <ShieldAlert size={12} /> {t('analysis_step.main_disadvantage')}
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
                       <Sword size={12} /> {t('analysis_step.our_advantage')}
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
               {t('analysis_step.empty_state')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalysisStep;
