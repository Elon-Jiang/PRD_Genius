
import React, { useState } from 'react';
import { Github, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { pushToGitHub } from '../services/githubService';

interface GithubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  defaultFileName: string;
}

const GithubExportModal: React.FC<GithubExportModalProps> = ({ 
  isOpen, 
  onClose, 
  htmlContent,
  defaultFileName 
}) => {
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState(defaultFileName || 'index.html');
  const [message, setMessage] = useState('feat: add product prototype via PRD Genius');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [successUrl, setSuccessUrl] = useState('');

  if (!isOpen) return null;

  const handlePush = async () => {
    if (!token || !owner || !repo || !path) {
        setStatus('error');
        setStatusMsg('请填写所有必填项 (*)');
        return;
    }

    setStatus('loading');
    setStatusMsg('正在推送到 GitHub...');

    try {
      // Ensure path ends in .html
      let safePath = path;
      if (!safePath.endsWith('.html')) safePath += '.html';

      const url = await pushToGitHub({
        token,
        owner,
        repo,
        path: safePath,
        content: htmlContent,
        message
      });
      
      setStatus('success');
      setStatusMsg('推送成功！');
      setSuccessUrl(url);
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setStatusMsg(e.message || '推送失败，请检查 Token 权限或仓库名称');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-semibold">
            <Github size={20} />
            导出到 GitHub
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
            
            {status === 'success' ? (
                <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">导出成功!</h3>
                    <p className="text-slate-500 text-sm px-4">您的代码已成功推送到仓库。</p>
                    <a 
                      href={successUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                        查看文件
                    </a>
                </div>
            ) : (
                <>
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100">
                        提示: 您需要一个 GitHub <a href="https://github.com/settings/tokens" target="_blank" className="underline font-bold">Personal Access Token</a> (Classic)，并勾选 <code>repo</code> 权限。
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">GitHub Token *</label>
                            <input 
                                type="password" 
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                placeholder="ghp_xxxxxxxxxxxx"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">用户名 (Owner) *</label>
                                <input 
                                    type="text" 
                                    value={owner}
                                    onChange={e => setOwner(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                    placeholder="your-username"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">仓库名 (Repo) *</label>
                                <input 
                                    type="text" 
                                    value={repo}
                                    onChange={e => setRepo(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                    placeholder="my-project"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">文件路径 *</label>
                            <input 
                                type="text" 
                                value={path}
                                onChange={e => setPath(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                placeholder="path/to/index.html"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Commit Message</label>
                            <input 
                                type="text" 
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                            />
                        </div>
                    </div>

                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded border border-red-100">
                            <AlertCircle size={14} /> {statusMsg}
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Footer */}
        {status !== 'success' && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm transition-colors"
                >
                    取消
                </button>
                <button 
                    onClick={handlePush}
                    disabled={status === 'loading'}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                    {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
                    {status === 'loading' ? '推送中...' : '推送到 GitHub'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GithubExportModal;
