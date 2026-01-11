
import { Feature, UserStory, CompetitorAnalysis } from "../types";

const API_ENDPOINT = '/api/gemini';

async function callApi(action: string, payload: any) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API call failed: ${response.statusText}`);
  }

  return response;
}

// Helper to get JSON response
async function callApiJson(action: string, payload: any) {
  const response = await callApi(action, payload);
  return response.json();
}

// Helper to get Text response
async function callApiText(action: string, payload: any) {
  const response = await callApi(action, payload);
  // Handle streaming response aggregation
  if (response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    // Flush any remaining bytes
    result += decoder.decode();
    return result;
  }
  return response.text();
}

/**
 * Decomposes the product description into Features and User Stories.
 */
export const generateBreakdown = async (description: string): Promise<{ features: Feature[], userStories: UserStory[] }> => {
  return callApiJson('generateBreakdown', { description });
};

/**
 * Refines existing breakdown based on user feedback.
 */
export const refineBreakdown = async (
  currentFeatures: Feature[], 
  currentUserStories: UserStory[], 
  feedback: string
): Promise<{ features: Feature[], userStories: UserStory[] }> => {
  return callApiJson('refineBreakdown', { currentFeatures, currentUserStories, feedback });
};

/**
 * Generates competitive analysis in Structured JSON format.
 */
export const generateAnalysis = async (productName: string, description: string): Promise<CompetitorAnalysis> => {
  return callApiJson('generateAnalysis', { productName, description });
};

/**
 * Refines the competitive analysis based on user feedback.
 */
export const refineAnalysis = async (currentAnalysis: CompetitorAnalysis, feedback: string): Promise<CompetitorAnalysis> => {
  return callApiJson('refineAnalysis', { currentAnalysis, feedback });
};

/**
 * Generates a Mermaid diagram code string.
 */
export const generateDiagram = async (features: Feature[]): Promise<string> => {
  const result = await callApiJson('generateDiagram', { features });
  return result.code;
};

/**
 * Refines the Mermaid diagram based on user feedback.
 */
export const refineDiagram = async (currentCode: string, feedback: string): Promise<string> => {
  const result = await callApiJson('refineDiagram', { currentCode, feedback });
  return result.code;
};

/**
 * Generates a Mermaid Mindmap code string.
 */
export const generateMindMap = async (productName: string, features: Feature[], userStories: UserStory[]): Promise<string> => {
  const result = await callApiJson('generateMindMap', { productName, features, userStories });
  return result.code;
};

/**
 * Refines the Mermaid Mindmap based on user feedback.
 */
export const refineMindMap = async (currentCode: string, feedback: string): Promise<string> => {
  const result = await callApiJson('refineMindMap', { currentCode, feedback });
  return result.code;
};

/**
 * Generates a single-file HTML prototype using Tailwind CSS.
 */
export const generatePrototype = async (features: Feature[], description: string): Promise<string> => {
  let code = await callApiText('generatePrototype', { features, description });
  
  // Cleanup markdown
  code = code.replace(/```html/g, '').replace(/```/g, '').trim();
  return code;
};

/**
 * Refines the HTML prototype based on user feedback.
 */
export const refinePrototype = async (currentHtml: string, feedback: string): Promise<string> => {
  let code = await callApiText('refinePrototype', { currentHtml, feedback });
 
  code = code.replace(/```html/g, '').replace(/```/g, '').trim();
  return code;
};

/**
 * General Chat Assistant
 */
export const sendChatMessage = async (history: {role: 'user' | 'ai', content: string}[], message: string): Promise<string> => {
  const result = await callApiJson('chat', { history, message });
  return result.text;
};
