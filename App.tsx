// ... (imports)
import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Step, PrdState, LoadingState, ChatMessage } from './types';
import * as GeminiService from './services/geminiService';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useTranslation } from 'react-i18next';

// Components
import Sidebar from './components/Sidebar';
import ChatOverlay from './components/ChatOverlay';
import InputStep from './components/steps/InputStep';
import BreakdownStep from './components/steps/BreakdownStep';
import AnalysisStep from './components/steps/AnalysisStep';
import DiagramsStep from './components/steps/DiagramsStep';
import MindMapStep from './components/steps/MindMapStep';
import PrototypeStep from './components/steps/PrototypeStep';
import PrdDocument from './components/PrdDocument';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // --- State ---
  const [currentStep, setCurrentStep] = useState<Step>(Step.INPUT);
  const [loading, setLoading] = useState<LoadingState>({ isGenerating: false, message: '' });
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      // We'll update this effect to localize the initial message if needed, 
      // but keeping state simple for now. 
      // Ideally, specific initial messages should be handled via useEffect or cleared on lang change.
      content: '你好！我是你的 AI 产品助手。有什么可以帮你的吗？你可以问我关于市场调研、竞品数据或者任何产品设计的问题。',
      timestamp: Date.now()
    }
  ]);

  // Update initial welcome message when language changes
  useEffect(() => {
     // Optional: You might want to reset chat or just add a new welcome message
  }, [i18n.language]);

  // Undo/Redo Hook for PRD Data
  // ... (rest of hook)
  const {
    data,
    setData,
    undo,
    redo,
    commitNow,
    canUndo,
    canRedo
  } = useUndoRedo<PrdState>({
    productName: '',
    description: '',
    userStories: [],
    features: [],
    competitorAnalysis: { summary: '', competitors: [] },
    mermaidDiagram: '',
    mindMap: '',
    prototypeHtml: '',
  });

  // ... (keyboard shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // --- Actions ---

  const handleGenerateBreakdown = async () => {
    if (!data.description) return;
    commitNow();
    
    setLoading({ isGenerating: true, message: t('common.generating') });
    try {
      const result = await GeminiService.generateBreakdown(data.description, i18n.language);
      setData(prev => ({
        ...prev,
        features: result.features,
        userStories: result.userStories
      }));
      setCurrentStep(Step.BREAKDOWN);
    } catch (error) {
      alert('生成失败，请检查API Key或稍后重试。');
      console.error(error);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  const handleGenerateAnalysis = async () => {
    commitNow();
    setLoading({ isGenerating: true, message: t('common.generating') });
    try {
      const result = await GeminiService.generateAnalysis(data.productName || 'Product', data.description, i18n.language);
      setData(prev => ({ ...prev, competitorAnalysis: result }));
      setCurrentStep(Step.ANALYSIS);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  const handleGenerateDiagrams = async () => {
    commitNow();
    setLoading({ isGenerating: true, message: t('common.generating') });
    try {
      const result = await GeminiService.generateDiagram(data.features, i18n.language);
      setData(prev => ({ ...prev, mermaidDiagram: result }));
      setCurrentStep(Step.DIAGRAMS);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  const handleGenerateMindMap = async () => {
    commitNow();
    setLoading({ isGenerating: true, message: t('common.generating') });
    try {
      const result = await GeminiService.generateMindMap(
        data.productName || 'Product', 
        data.features, 
        data.userStories,
        i18n.language
      );
      setData(prev => ({ ...prev, mindMap: result }));
      setCurrentStep(Step.MINDMAP);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  const handleGeneratePrototype = async () => {
    commitNow();
    setLoading({ isGenerating: true, message: t('common.generating') });
    try {
      const result = await GeminiService.generatePrototype(data.features, data.description, i18n.language);
      setData(prev => ({ ...prev, prototypeHtml: result }));
      setCurrentStep(Step.PROTOTYPE);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  const handleExportHtml = () => {
    if (!data.prototypeHtml) return;
    const blob = new Blob([data.prototypeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.productName || 'prototype').replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Enable Print Mode - This swaps the visual layout
    setIsPrinting(true);
  };

  // --- Refinement Actions ---

  const handleRefine = async () => {
    if (!refinementInput.trim()) return;
    commitNow();
    setIsRefining(true);
    
    try {
      if (currentStep === Step.BREAKDOWN) {
        const result = await GeminiService.refineBreakdown(data.features, data.userStories, refinementInput, i18n.language);
        setData(prev => ({
          ...prev,
          features: result.features,
          userStories: result.userStories
        }));
      } else if (currentStep === Step.ANALYSIS) {
         const result = await GeminiService.refineAnalysis(data.competitorAnalysis, refinementInput, i18n.language);
         setData(prev => ({ ...prev, competitorAnalysis: result }));
      } else if (currentStep === Step.DIAGRAMS) {
        const result = await GeminiService.refineDiagram(data.mermaidDiagram, refinementInput, i18n.language);
        setData(prev => ({ ...prev, mermaidDiagram: result }));
      } else if (currentStep === Step.MINDMAP) {
        const result = await GeminiService.refineMindMap(data.mindMap, refinementInput, i18n.language);
        setData(prev => ({ ...prev, mindMap: result }));
      } else if (currentStep === Step.PROTOTYPE) {
        const result = await GeminiService.refinePrototype(data.prototypeHtml, refinementInput, i18n.language);
        setData(prev => ({ ...prev, prototypeHtml: result }));
      }
      setRefinementInput('');
    } catch (error) {
      console.error("Refinement failed", error);
      alert("AI 优化失败，请稍后重试");
    } finally {
      setIsRefining(false);
    }
  };

  // --- Chat Actions ---
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const history = chatMessages.map(msg => ({ role: msg.role, content: msg.content }));
      const responseText = await GeminiService.sendChatMessage(history, newUserMsg.content, i18n.language);
      
      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Chat failed", error);
      const errorMsg: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'ai',
         content: "抱歉，遇到了一点问题，请稍后再试。",
         timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderContent = () => {
    if (loading.isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="text-primary" size={24} />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-slate-800">{loading.message}</h3>
          <p className="text-slate-500 mt-2 max-w-sm text-center">Gemini 正在分析上下文并生成内容...</p>
        </div>
      );
    }

    switch (currentStep) {
      case Step.INPUT: 
        return <InputStep 
          data={data} 
          setData={setData} 
          onGenerate={handleGenerateBreakdown} 
          loading={loading} 
        />;
      case Step.BREAKDOWN: 
        return <BreakdownStep 
          data={data} 
          setData={setData} 
          onRefine={handleRefine}
          isRefining={isRefining}
          refinementInput={refinementInput}
          setRefinementInput={setRefinementInput}
          onNext={handleGenerateAnalysis} 
        />;
      case Step.ANALYSIS: 
        return <AnalysisStep 
          data={data} 
          setData={setData} 
          onRefine={handleRefine}
          isRefining={isRefining}
          refinementInput={refinementInput}
          setRefinementInput={setRefinementInput}
          onNext={handleGenerateDiagrams} 
        />;
      case Step.DIAGRAMS: 
        return <DiagramsStep 
          data={data} 
          setData={setData} 
          onRefine={handleRefine}
          isRefining={isRefining}
          refinementInput={refinementInput}
          setRefinementInput={setRefinementInput}
          onNext={handleGenerateMindMap} 
        />;
      case Step.MINDMAP: 
        return <MindMapStep 
          data={data} 
          setData={setData} 
          onRefine={handleRefine}
          isRefining={isRefining}
          refinementInput={refinementInput}
          setRefinementInput={setRefinementInput}
          onNext={handleGeneratePrototype} 
        />;
      case Step.PROTOTYPE: 
        return <PrototypeStep 
          data={data} 
          setData={setData} 
          onRefine={handleRefine}
          isRefining={isRefining}
          refinementInput={refinementInput}
          setRefinementInput={setRefinementInput}
          onGenerate={handleGeneratePrototype} 
          onExport={handleExportHtml} 
        />;
      default: return null;
    }
  };

  // --- DUAL RENDER LAYOUT ---
  // We render BOTH components but hide one using display:none.
  // This preserves React state and ensures DOM availability for both modes.

  return (
    <>
      {/* 1. Dashboard Layout (Hidden when printing) */}
      <div 
        className="dashboard-ui flex h-screen w-screen overflow-hidden bg-slate-50 font-sans print:hidden"
        style={{ display: isPrinting ? 'none' : 'flex' }}
      >
        <Sidebar 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onExportPDF={handleExportPDF}
        />
        <main className="flex-1 h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden p-8 pb-0 relative flex flex-col">
            {renderContent()}
          </div>
        </main>
        <ChatOverlay 
          isOpen={isChatOpen} 
          setIsOpen={setIsChatOpen}
          messages={chatMessages}
          input={chatInput}
          setInput={setChatInput}
          onSend={handleSendChatMessage}
          isLoading={isChatLoading}
        />
      </div>

      {/* 2. Print Document Layout (Visible ONLY when printing) */}
      {/* It needs to be present in DOM but hidden normally so images/charts can pre-load */}
      <div 
        className="print-doc min-h-screen w-full bg-white overflow-auto"
        style={{ display: isPrinting ? 'block' : 'none' }}
      >
        {isPrinting && (
           <PrdDocument data={data} onClose={() => setIsPrinting(false)} />
        )}
      </div>
    </>
  );
};

export default App;