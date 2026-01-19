// ... (imports)
import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { PrdState, LoadingState } from '../../types';
import { useTranslation } from 'react-i18next';

interface InputStepProps {
  data: PrdState;
  setData: (data: (prev: PrdState) => PrdState) => void;
  onGenerate: () => void;
  loading: LoadingState;
}

const InputStep: React.FC<InputStepProps> = ({ data, setData, onGenerate, loading }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('input_step.title')}</h1>
      <p className="text-slate-500 mb-8">{t('input_step.subtitle')}</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.product_name') || 'Product Name'}</label>
          <input 
            type="text"
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            placeholder={t('input_step.product_name_placeholder')}
            value={data.productName}
            onChange={(e) => setData((prev) => ({...prev, productName: e.target.value}))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.product_description') || 'Product Description'}</label>
          <textarea 
            className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none h-48 resize-none transition-all leading-relaxed"
            placeholder={t('input_step.placeholder')}
            value={data.description}
            onChange={(e) => setData((prev) => ({...prev, description: e.target.value}))}
          />
        </div>

        <button 
          onClick={onGenerate}
          disabled={!data.description || loading.isGenerating}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.isGenerating ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
          {loading.isGenerating ? loading.message : t('input_step.generate_btn')}
        </button>
      </div>
    </div>
  );
};

export default InputStep;
