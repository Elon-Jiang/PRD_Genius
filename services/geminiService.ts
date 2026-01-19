// ... (previous code)
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
export const generateBreakdown = async (description: string, language: string): Promise<{ features: Feature[], userStories: UserStory[] }> => {
  return callApiJson('generateBreakdown', { description, language });
};

/**
 * Refines existing breakdown based on user feedback.
 */
export const refineBreakdown = async (
  currentFeatures: Feature[], 
  currentUserStories: UserStory[], 
  feedback: string,
  language: string
): Promise<{ features: Feature[], userStories: UserStory[] }> => {
  return callApiJson('refineBreakdown', { currentFeatures, currentUserStories, feedback, language });
};

/**
 * Generates competitive analysis in Structured JSON format.
 */
export const generateAnalysis = async (productName: string, description: string, language: string): Promise<CompetitorAnalysis> => {
  return callApiJson('generateAnalysis', { productName, description, language });
};

/**
 * Refines the competitive analysis based on user feedback.
 */
export const refineAnalysis = async (currentAnalysis: CompetitorAnalysis, feedback: string, language: string): Promise<CompetitorAnalysis> => {
  return callApiJson('refineAnalysis', { currentAnalysis, feedback, language });
};

/**
 * Generates a Mermaid diagram code string.
 */
export const generateDiagram = async (features: Feature[], language: string): Promise<string> => {
  const result = await callApiJson('generateDiagram', { features, language });
  return result.code;
};

/**
 * Refines the Mermaid diagram based on user feedback.
 */
export const refineDiagram = async (currentCode: string, feedback: string, language: string): Promise<string> => {
  const result = await callApiJson('refineDiagram', { currentCode, feedback, language });
  return result.code;
};

/**
 * Generates a Mermaid Mindmap code string.
 */
export const generateMindMap = async (productName: string, features: Feature[], userStories: UserStory[], language: string): Promise<string> => {
  const result = await callApiJson('generateMindMap', { productName, features, userStories, language });
  return result.code;
};

/**
 * Refines the Mermaid Mindmap based on user feedback.
 */
export const refineMindMap = async (currentCode: string, feedback: string, language: string): Promise<string> => {
  const result = await callApiJson('refineMindMap', { currentCode, feedback, language });
  return result.code;
};

/**
 * Generates a single-file HTML prototype using Tailwind CSS.
 */
export const generatePrototype = async (features: Feature[], description: string, language: string): Promise<string> => {
  let code = await callApiText('generatePrototype', { features, description, language });
  
  // Cleanup markdown
  code = code.replace(/```html/g, '').replace(/```/g, '').trim();
  return code;
};

/**
 * Refines the HTML prototype based on user feedback.
 */
export const refinePrototype = async (currentHtml: string, feedback: string, language: string): Promise<string> => {
  let code = await callApiText('refinePrototype', { currentHtml, feedback, language });
 
  code = code.replace(/```html/g, '').replace(/```/g, '').trim();
  return code;
};

/**
 * General Chat Assistant
 */
export const sendChatMessage = async (history: {role: 'user' | 'ai', content: string}[], message: string, language: string): Promise<string> => {
  const result = await callApiJson('chat', { history, message, language });
  return result.text;
};
