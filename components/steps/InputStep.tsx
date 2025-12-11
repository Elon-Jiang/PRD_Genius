
import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { PrdState, LoadingState } from '../../types';

interface InputStepProps {
  data: PrdState;
  setData: (data: (prev: PrdState) => PrdState) => void;
  onGenerate: () => void;
  loading: LoadingState;
}

const InputStep: React.FC<InputStepProps> = ({ data, setData, onGenerate, loading }) => {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">描述你的产品</h1>
      <p className="text-slate-500 mb-8">用自然语言告诉我你的想法，我来帮你完成结构拆解、规格说明和原型设计。</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">产品名称</label>
          <input 
            type="text"
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            placeholder="例如：智能任务管理 Pro"
            value={data.productName}
            onChange={(e) => setData((prev) => ({...prev, productName: e.target.value}))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">产品描述</label>
          <textarea 
            className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none h-48 resize-none transition-all leading-relaxed"
            placeholder="描述产品要解决的问题、核心功能以及目标用户..."
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
          {loading.isGenerating ? loading.message : '开始分析'}
        </button>
      </div>
    </div>
  );
};

export default InputStep;
