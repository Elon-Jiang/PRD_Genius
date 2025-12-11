
import React from 'react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { PrdState, UserStory, Feature } from '../../types';
import RefinementPanel from '../RefinementPanel';

interface BreakdownStepProps {
  data: PrdState;
  setData: (data: (prev: PrdState) => PrdState) => void;
  onRefine: () => void;
  isRefining: boolean;
  refinementInput: string;
  setRefinementInput: (val: string) => void;
  onNext: () => void;
}

const BreakdownStep: React.FC<BreakdownStepProps> = ({ 
  data, setData, onRefine, isRefining, refinementInput, setRefinementInput, onNext 
}) => {

  const updateUserStory = (id: string, field: keyof UserStory, value: string) => {
    setData((prev) => ({
      ...prev,
      userStories: prev.userStories.map(u => u.id === id ? { ...u, [field]: value } : u)
    }));
  };

  const updateFeature = (id: string, field: keyof Feature, value: string) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const handleAddUserStory = () => {
    setData((prev) => ({
      ...prev,
      userStories: [...prev.userStories, {
        id: Date.now().toString(),
        role: '用户',
        action: '新操作',
        benefit: '价值'
      }]
    }));
  };

  const handleDeleteUserStory = (id: string) => {
    setData((prev) => ({
      ...prev,
      userStories: prev.userStories.filter(u => u.id !== id)
    }));
  };

  const handleAddFeature = () => {
    setData((prev) => ({
      ...prev,
      features: [...prev.features, {
        id: Date.now().toString(),
        name: '新功能',
        description: '功能描述',
        priority: 'P1'
      }]
    }));
  };

  const handleDeleteFeature = (id: string) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.filter(f => f.id !== id)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">需求拆解</h2>
          <p className="text-slate-500 text-sm">AI 生成的功能和故事，您可以直接编辑或让 AI 调整。</p>
        </div>
        <button 
          onClick={onNext}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
        >
          下一步：竞品分析 <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-6 pb-20">
        
        <RefinementPanel 
          input={refinementInput}
          setInput={setRefinementInput}
          onSend={onRefine}
          isRefining={isRefining}
          placeholder="例如：'增加一个社交登录功能' 或 '把所有P1优先级改为P0'..."
        />

        {/* User Stories Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded uppercase">用户故事</span>
                User Stories
             </h3>
             <button onClick={handleAddUserStory} className="text-sm text-primary hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                <Plus size={14} /> 新增故事
             </button>
          </div>
          <div className="grid gap-4">
            {data.userStories.map((story) => (
              <div key={story.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                <button 
                  onClick={() => handleDeleteUserStory(story.id)}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex flex-wrap gap-2 text-sm text-slate-700 items-center pr-8">
                  <span className="font-mono text-slate-400 text-xs whitespace-nowrap">作为一个</span>
                  <input 
                    className="bg-slate-50 px-2 py-1 rounded border-transparent focus:border-primary focus:ring-0 border hover:border-slate-300 transition-colors min-w-[80px]"
                    value={story.role}
                    onChange={(e) => updateUserStory(story.id, 'role', e.target.value)}
                  />
                  <span className="font-mono text-slate-400 text-xs whitespace-nowrap">我想要</span>
                  <input 
                    className="flex-1 bg-slate-50 px-2 py-1 rounded border-transparent focus:border-primary focus:ring-0 border hover:border-slate-300 transition-colors min-w-[200px]"
                    value={story.action}
                    onChange={(e) => updateUserStory(story.id, 'action', e.target.value)}
                  />
                  <span className="font-mono text-slate-400 text-xs whitespace-nowrap">以便于</span>
                  <input 
                    className="flex-1 bg-slate-50 px-2 py-1 rounded border-transparent focus:border-primary focus:ring-0 border hover:border-slate-300 transition-colors min-w-[200px]"
                    value={story.benefit}
                    onChange={(e) => updateUserStory(story.id, 'benefit', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
               <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded uppercase">功能规格</span>
               Functional Features
             </h3>
             <button onClick={handleAddFeature} className="text-sm text-primary hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                <Plus size={14} /> 新增功能
             </button>
          </div>
          <div className="grid gap-4">
            {data.features.map((feature) => (
              <div key={feature.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm group relative">
                <button 
                  onClick={() => handleDeleteFeature(feature.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex justify-between items-start mb-2 pr-8">
                  <input 
                    className="font-semibold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full text-lg"
                    value={feature.name}
                    onChange={(e) => updateFeature(feature.id, 'name', e.target.value)}
                  />
                  <select 
                    value={feature.priority}
                    onChange={(e) => updateFeature(feature.id, 'priority', e.target.value as any)}
                    className={`text-xs font-bold px-2 py-1 rounded uppercase border-none cursor-pointer ${
                      feature.priority === 'P0' ? 'bg-red-100 text-red-700' : 
                      feature.priority === 'P1' ? 'bg-orange-100 text-orange-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                </div>
                <textarea 
                  className="w-full text-sm text-slate-600 bg-transparent border-none p-0 focus:ring-0 resize-none"
                  value={feature.description}
                  onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BreakdownStep;
