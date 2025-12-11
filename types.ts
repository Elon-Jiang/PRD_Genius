export enum Step {
  INPUT = 'INPUT',
  BREAKDOWN = 'BREAKDOWN',
  ANALYSIS = 'ANALYSIS',
  DIAGRAMS = 'DIAGRAMS',
  MINDMAP = 'MINDMAP',
  PROTOTYPE = 'PROTOTYPE',
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
}

export interface Competitor {
  id: string;
  name: string;
  coreAdvantage: string; // 核心优势
  mainDisadvantage: string; // 主要劣势
  overlap: string; // 功能重合度 (High/Medium/Low)
  ourAdvantage: string; // 我们如何胜出
}

export interface CompetitorAnalysis {
  summary: string; // 核心差异化总结
  competitors: Competitor[];
}

export interface PrdState {
  productName: string;
  description: string;
  userStories: UserStory[];
  features: Feature[];
  competitorAnalysis: CompetitorAnalysis;
  mermaidDiagram: string; // Mermaid flowchart code
  mindMap: string; // Mermaid mindmap code
  prototypeHtml: string; // HTML code
}

export interface LoadingState {
  isGenerating: boolean;
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}