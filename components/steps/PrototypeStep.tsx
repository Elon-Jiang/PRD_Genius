// ... (imports)
import React, { useState } from 'react';
import { Download, RefreshCw, Code, Copy, ExternalLink, Maximize2, Play, Search, Replace, AlignLeft, X } from 'lucide-react';
import { PrdState } from '../../types';
import RefinementPanel from '../RefinementPanel';
import { useTranslation } from 'react-i18next';

interface PrototypeStepProps {
  data: PrdState;
  setData: (data: (prev: PrdState) => PrdState) => void;
  onRefine: () => void;
  isRefining: boolean;
  refinementInput: string;
  setRefinementInput: (val: string) => void;
  onGenerate: () => void;
  onExport: () => void;
}

const PrototypeStep: React.FC<PrototypeStepProps> = ({
  data, setData, onRefine, isRefining, refinementInput, setRefinementInput, onGenerate, onExport
}) => {
  const { t } = useTranslation();
  const [isCodeViewMaximized, setIsCodeViewMaximized] = useState(false);
  const [isPreviewFull, setIsPreviewFull] = useState(false);
  
  // Search & Replace State
  const [showSearch, setShowSearch] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(findText, 'g');
    const newHtml = data.prototypeHtml.replace(regex, replaceText);
    setData((prev) => ({ ...prev, prototypeHtml: newHtml }));
    alert(`Replaced all occurrences`);
  };

  const handleFormatCode = () => {
    // Simple HTML formatter
    let indent = 0;
    const code = data.prototypeHtml
      .replace(/>\s+</g, '><') // remove whitespace between tags
      .replace(/</g, '\n<') // newline before tags
      .replace(/>/g, '>\n') // newline after tags
      .split('\n')
      .map(line => {
        line = line.trim();
        if (!line) return null;
        if (line.match(/^<\//)) indent = Math.max(0, indent - 1); // closing tag
        const output = '  '.repeat(indent) + line;
        if (line.match(/^<[^/]/) && !line.match(/\/>$/) && !line.match(/^<.*\/>/) && !line.includes('</')) {
           // Opening tag that isn't self-closing and doesn't contain closing tag in same line
           // (Simple heuristic, not perfect for all HTML)
           if(!['<br>', '<hr>', '<img>', '<input>', '<meta>', '<link>'].some(t => line.startsWith(t.slice(0,-1)))) {
             indent++;
           }
        }
        return output;
      })
      .filter(l => l !== null)
      .join('\n');
      
    setData((prev) => ({ ...prev, prototypeHtml: code }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-8 pt-2 shrink-0">
        <h2 className="text-2xl font-bold text-slate-100">{t('prototype_step.title')}</h2>
        <div className="flex gap-2">
           <button 
            onClick={onExport}
            disabled={!data.prototypeHtml}
            className="px-4 py-2 text-slate-900 bg-white border border-white rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} /> {t('prototype_step.export_html') || 'Export HTML'}
          </button>
           <button 
            onClick={onGenerate}
            className="px-4 py-2 text-white bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2"
          >
            <RefreshCw size={16} /> {t('prototype_step.recode') || 'Re-code'}
          </button>
        </div>
      </div>

      <div className="px-8 shrink-0">
        <RefinementPanel 
          input={refinementInput}
          setInput={setRefinementInput}
          onSend={onRefine}
          isRefining={isRefining}
          placeholder={t('prototype_step.refine_placeholder')}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden border-t border-slate-800/50 min-h-0">
        {/* Code View */}
        <div className={`transition-all duration-300 ease-in-out flex flex-col bg-[#0d1117] border-r border-slate-800 overflow-hidden ${isCodeViewMaximized ? 'w-full lg:w-1/2' : 'hidden lg:flex lg:w-1/3'}`}>
          {/* Editor Toolbar */}
          <div className="flex flex-col bg-[#161b22] border-b border-slate-800">
            <div className="flex items-center justify-between p-2">
                <div className="text-slate-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <Code size={12} /> {t('prototype_step.html_tailwind')}
                </div>
                <div className="flex items-center gap-1">
                <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-1.5 rounded transition-colors ${showSearch ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    title={t('prototype_step.find_replace')}
                >
                    <Search size={14} />
                </button>
                <button 
                    onClick={handleFormatCode}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title={t('prototype_step.format_code')}
                >
                    <AlignLeft size={14} />
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button 
                    onClick={() => {
                    navigator.clipboard.writeText(data.prototypeHtml);
                    alert(t('prototype_step.code_copied'));
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title={t('prototype_step.copy_all')}
                >
                    <Copy size={14} />
                </button>
                <button 
                    onClick={() => {
                    const blob = new Blob([data.prototypeHtml], { type: 'text/html' });
                    window.open(URL.createObjectURL(blob), '_blank');
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title={t('prototype_step.preview_new_tab')}
                >
                    <ExternalLink size={14} />
                </button>
                <button 
                    onClick={() => setIsCodeViewMaximized(!isCodeViewMaximized)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title={isCodeViewMaximized ? "Restore Default" : "Expand Code"}
                >
                    <Maximize2 size={14} />
                </button>
                </div>
            </div>

            {/* Search & Replace Bar */}
            {showSearch && (
                <div className="p-2 bg-slate-800 flex items-center gap-2 animate-in slide-in-from-top-2 border-b border-slate-700">
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                className="w-full bg-[#0d1117] border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:border-blue-500 outline-none"
                                placeholder={t('prototype_step.search_placeholder')}
                                value={findText}
                                onChange={e => setFindText(e.target.value)}
                            />
                        </div>
                        <div className="relative flex-1">
                            <input 
                                className="w-full bg-[#0d1117] border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:border-blue-500 outline-none"
                                placeholder={t('prototype_step.replace_placeholder')}
                                value={replaceText}
                                onChange={e => setReplaceText(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleReplaceAll}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 flex items-center gap-1"
                    >
                        <Replace size={12} /> {t('prototype_step.replace_btn')}
                    </button>
                    <button 
                        onClick={() => setShowSearch(false)}
                        className="p-1 text-slate-400 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
          </div>
          
          <textarea 
            className="flex-1 bg-[#0d1117] text-slate-300 font-mono text-xs outline-none resize-none p-4 leading-relaxed custom-scroll"
            value={data.prototypeHtml}
            onChange={(e) => setData((prev) => ({...prev, prototypeHtml: e.target.value}))}
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className={isPreviewFull ? "fixed inset-0 z-[100] bg-[#0d1117] flex flex-col" : `flex-1 bg-[#0d1117] relative flex flex-col items-center ${isCodeViewMaximized ? 'hidden' : 'block'}`}>
          
          <div className="w-full h-8 bg-[#161b22] border-b border-slate-800 flex items-center justify-between px-4 text-xs text-slate-500">
             <span></span>
             <span>{t('prototype_step.preview_title')}</span>
             <button 
               onClick={() => setIsPreviewFull(!isPreviewFull)}
               className="p-1 hover:text-white transition-colors"
               title={isPreviewFull ? "Exit Fullscreen" : "Fullscreen Preview"}
             >
               {isPreviewFull ? <X size={14} /> : <Maximize2 size={14} />}
             </button>
          </div>

          <div className="flex-1 w-full bg-[#0d1117] overflow-hidden flex items-center justify-center">
            {data.prototypeHtml ? (
              <iframe 
                title="Prototype Preview"
                srcDoc={data.prototypeHtml}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-forms"
              />
            ) : (
              <div className="text-center text-slate-500">
                <Play size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('prototype_step.empty_state')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrototypeStep;
