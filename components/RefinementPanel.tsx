
import React from 'react';
import { Sparkles, Loader2, Send } from 'lucide-react';

interface RefinementPanelProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isRefining: boolean;
  placeholder: string;
}

const RefinementPanel: React.FC<RefinementPanelProps> = ({
  input,
  setInput,
  onSend,
  isRefining,
  placeholder
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-6 shadow-sm shrink-0">
      <label className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
        <Sparkles size={16} className="text-blue-600" /> 
        AI 优化助手
      </label>
      <div className="flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder={placeholder}
          className="flex-1 border border-blue-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white/80"
          disabled={isRefining}
        />
        <button 
          onClick={onSend}
          disabled={isRefining || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {isRefining ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          {isRefining ? '优化中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default RefinementPanel;
