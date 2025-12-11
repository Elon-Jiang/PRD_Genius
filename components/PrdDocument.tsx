import React from 'react';
import { PrdState } from '../types';
import MermaidRenderer from './MermaidRenderer';
import VisualMindMapEditor from './VisualMindMapEditor';
import { X, Printer } from 'lucide-react';

interface PrdDocumentProps {
  data: PrdState;
  onClose?: () => void;
}

const PrdDocument: React.FC<PrdDocumentProps> = ({ data, onClose }) => {
  const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    // Focus is important for some browsers/iframe environments
    window.focus(); 
    window.print();
  };

  return (
    <div className="w-full bg-white text-slate-900 relative">
      
      {/* Print Toolbar (Sticky Top, Hidden when Printing) */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-slate-900 text-white p-4 shadow-lg print:hidden flex justify-between items-center animate-in slide-in-from-top-4">
        <div className="font-semibold text-lg flex items-center gap-2">
            <Printer size={20} className="text-blue-400" />
            打印预览
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
                <Printer size={16} /> 确认打印
            </button>
            {onClose && (
                <button 
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                <X size={16} /> 关闭预览
                </button>
            )}
        </div>
      </div>

      {/* Cover Page */}
      <div className="min-h-screen flex flex-col justify-center items-center text-center page-break-after">
        <h1 className="text-5xl font-bold mb-8 text-slate-900">{data.productName || '未命名产品'}</h1>
        <div className="text-2xl text-slate-500 mb-16">产品需求文档 (PRD)</div>
        
        <div className="text-slate-600 space-y-2">
          <p>版本: v1.0.0</p>
          <p>日期: {date}</p>
          <p>状态: 待评审</p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto p-8 prose prose-slate max-w-none print:max-w-none print:px-6">
        
        {/* Table of Contents */}
        <div className="page-break-after">
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-slate-900">目录</h2>
          <ul className="list-none space-y-2 p-0">
            <li className="flex justify-between border-b border-slate-200 border-dashed py-1">
              <span>1. 产品概述</span>
            </li>
            <li className="flex justify-between border-b border-slate-200 border-dashed py-1">
              <span>2. 需求拆解 (User Stories & Features)</span>
            </li>
            <li className="flex justify-between border-b border-slate-200 border-dashed py-1">
              <span>3. 竞品分析</span>
            </li>
            <li className="flex justify-between border-b border-slate-200 border-dashed py-1">
              <span>4. 业务流程图</span>
            </li>
            <li className="flex justify-between border-b border-slate-200 border-dashed py-1">
              <span>5. 产品结构图</span>
            </li>
            <li className="flex justify-between border-b border-slate-200 border-dashed py-1">
              <span>6. 界面原型代码</span>
            </li>
          </ul>
        </div>

        {/* 1. Product Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="text-slate-400">01</span> 产品概述
          </h2>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-semibold mb-2">产品背景与目标</h3>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
              {data.description || '暂无描述'}
            </p>
          </div>
        </div>

        {/* 2. Breakdown */}
        <div className="mb-12 page-break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="text-slate-400">02</span> 需求拆解
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">核心功能 (Features)</h3>
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 border border-slate-300 w-1/4">功能名称</th>
                <th className="p-3 border border-slate-300 w-1/6">优先级</th>
                <th className="p-3 border border-slate-300">描述</th>
              </tr>
            </thead>
            <tbody>
              {data.features.map(f => (
                <tr key={f.id}>
                  <td className="p-3 border border-slate-200 font-medium">{f.name}</td>
                  <td className="p-3 border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      f.priority === 'P0' ? 'bg-red-100 text-red-800' :
                      f.priority === 'P1' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {f.priority}
                    </span>
                  </td>
                  <td className="p-3 border border-slate-200 text-sm text-slate-600">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-xl font-semibold mb-3">用户故事 (User Stories)</h3>
          <div className="grid gap-2">
            {data.userStories.map((us, idx) => (
              <div key={us.id} className="p-3 bg-white border border-slate-200 rounded text-sm flex gap-2">
                <span className="font-mono text-slate-400">{idx + 1}.</span>
                <div>
                  <span className="font-semibold text-slate-700">作为 {us.role}</span>，
                  <span className="text-slate-600">我想要 {us.action}</span>，
                  <span className="text-slate-500 italic">以便于 {us.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Analysis */}
        <div className="mb-12 page-break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="text-slate-400">03</span> 竞品分析
          </h2>
          
          <div className="bg-blue-50 p-4 rounded mb-6 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-900 mb-1">差异化总结</h4>
            <p className="text-sm text-blue-800">{data.competitorAnalysis.summary || '暂无总结'}</p>
          </div>

          <div className="space-y-6">
            {data.competitorAnalysis.competitors.map(c => (
              <div key={c.id} className="border border-slate-200 rounded-lg overflow-hidden page-break-inside-avoid">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-lg">{c.name}</span>
                  <span className="text-xs px-2 py-1 bg-white border rounded">重合度: {c.overlap}</span>
                </div>
                <div className="p-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-green-700 mb-1">核心优势</div>
                    <div className="text-slate-600">{c.coreAdvantage}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-700 mb-1">主要劣势</div>
                    <div className="text-slate-600">{c.mainDisadvantage}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700 mb-1">我方策略</div>
                    <div className="text-slate-600">{c.ourAdvantage}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Diagrams */}
        <div className="mb-12 page-break-before">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="text-slate-400">04</span> 业务流程图
          </h2>
          <div className="border border-slate-200 rounded-lg p-4 bg-white min-h-[400px] print:p-6 print:min-h-[1000px]">
            {data.mermaidDiagram ? (
               <MermaidRenderer chart={data.mermaidDiagram} />
            ) : (
               <div className="text-center text-slate-400 py-10">暂无流程图</div>
            )}
          </div>
        </div>

        {/* 5. MindMap */}
        <div className="mb-12 page-break-before">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="text-slate-400">05</span> 产品结构图
          </h2>
          <div className="border border-slate-200 rounded-lg p-4 bg-white min-h-[400px] print:p-6 print:min-h-[900px]">
             {data.mindMap ? (
               <MermaidRenderer chart={data.mindMap} />
            ) : (
               <div className="text-center text-slate-400 py-10">暂无思维导图</div>
            )}
          </div>

          {data.mindMap && (
            <div className="mt-6 border border-slate-200 rounded-lg bg-white print:p-6">
              <h3 className="text-lg font-semibold mb-3 text-slate-800">思维导图可视化编辑视图</h3>
              <VisualMindMapEditor mermaidCode={data.mindMap} onChange={() => {}} readOnly />
            </div>
          )}
        </div>

        {/* 6. Prototype */}
        <div className="mb-12 page-break-before">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="text-slate-400">06</span> 原型设计说明
          </h2>
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-hidden h-[500px] relative print:text-sm print:h-auto print:overflow-visible print:p-6">
            <div className="absolute top-0 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded-bl">HTML Source Preview</div>
            <pre className="whitespace-pre-wrap break-all print:text-sm">
              {data.prototypeHtml ? data.prototypeHtml.slice(0, 2000) + '\n... (完整代码请导出查看)' : '暂无原型代码'}
            </pre>
          </div>
        </div>

      </div>
      
      {/* Footer */}
      <div className="text-center text-slate-400 text-xs py-8 border-t border-slate-100 mt-8">
        Generated by PRD Genius AI
      </div>
    </div>
  );
};

export default PrdDocument;