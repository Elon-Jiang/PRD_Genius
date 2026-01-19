import { GoogleGenAI, Type } from "@google/genai";

// Define simple types locally to avoid import issues from parent directory
interface Feature {
  id: string;
  name: string;
  description: string;
  priority: string;
}
interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
}
interface CompetitorAnalysis {
  summary: string;
  competitors: any[];
}

// Initialize Gemini Client
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  // Vercel serverless functions usually run in regions that can access Google directly.
  // Removing the custom baseUrl to avoid potential proxy issues in server-side environment.
});

const modelFlash = "gemini-2.5-flash";
// Using pro for complex coding/diagramming tasks
// Keeping consistency with original file which used flash for pro variable
const modelPro = "gemini-2.5-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { action, ...payload } = req.body;

  try {
    switch (action) {
      case "generateBreakdown":
        return await handleGenerateBreakdown(payload, res);
      case "refineBreakdown":
        return await handleRefineBreakdown(payload, res);
      case "generateAnalysis":
        return await handleGenerateAnalysis(payload, res);
      case "refineAnalysis":
        return await handleRefineAnalysis(payload, res);
      case "generateDiagram":
        return await handleGenerateDiagram(payload, res);
      case "refineDiagram":
        return await handleRefineDiagram(payload, res);
      case "generateMindMap":
        return await handleGenerateMindMap(payload, res);
      case "refineMindMap":
        return await handleRefineMindMap(payload, res);
      case "generatePrototype":
        return await handleGeneratePrototype(payload, res);
      case "refinePrototype":
        return await handleRefinePrototype(payload, res);
      case "chat":
        return await handleChat(payload, res);
      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    // Return detailed error message for debugging
    const errorMessage = error.message || "Internal Server Error";
    const errorDetails = error.response ? JSON.stringify(error.response) : "";
    return res.status(500).json({ error: `${errorMessage} ${errorDetails}` });
  }
}

async function handleGenerateBreakdown({ description }, res) {
  const prompt = `
    Act as a Senior Product Manager.
    Based on the following product description, break it down into:
    1. A list of core Functional Features (limit to 6-8 key features).
    2. A list of key User Stories (limit to 5-6 key stories).
    
    Product Description: "${description}"
    
    Prioritize features based on MVP (Minimum Viable Product) logic.
    
    IMPORTANT: Output everything in Chinese (Simplified).
  `;

  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          features: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["P0", "P1", "P2"] },
              },
              required: ["id", "name", "description", "priority"],
            },
          },
          userStories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                role: { type: Type.STRING },
                action: { type: Type.STRING },
                benefit: { type: Type.STRING },
              },
              required: ["id", "role", "action", "benefit"],
            },
          },
        },
      },
    },
  });

  if (response.text) {
    return res.json(JSON.parse(response.text));
  }
  throw new Error("Failed to generate breakdown");
}

async function handleRefineBreakdown(
  { currentFeatures, currentUserStories, feedback },
  res
) {
  const context = JSON.stringify({
    features: currentFeatures,
    userStories: currentUserStories,
  });

  const prompt = `
    Act as a Senior Product Manager.
    I have an existing list of features and user stories in JSON format.
    
    Current State: ${context}
    
    User Feedback/Request: "${feedback}"
    
    Task: Update the features and user stories based on the user's feedback. 
    - If the user asks to add something, add it.
    - If the user asks to modify, modify it.
    - Keep the existing IDs if possible, or generate new unique string IDs for new items.
    
    IMPORTANT: Output everything in Chinese (Simplified). Return the full updated JSON structure.
  `;

  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          features: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["P0", "P1", "P2"] },
              },
              required: ["id", "name", "description", "priority"],
            },
          },
          userStories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                role: { type: Type.STRING },
                action: { type: Type.STRING },
                benefit: { type: Type.STRING },
              },
              required: ["id", "role", "action", "benefit"],
            },
          },
        },
      },
    },
  });

  if (response.text) {
    return res.json(JSON.parse(response.text));
  }
  throw new Error("Failed to refine breakdown");
}

async function handleGenerateAnalysis({ productName, description }, res) {
  const prompt = `
    Conduct a comprehensive competitive analysis for a product named "${productName}".
    Description: "${description}"
    
    Identify 3 potential competitors (real or hypothetical archetypes).
    
    Output a JSON object with:
    1. 'summary': A brief paragraph summarizing how our product stands out against the market.
    2. 'competitors': An array of competitor objects.
    
    Each competitor object must have:
    - id: unique string
    - name: Competitor Name
    - coreAdvantage: Key strength (核心优势)
    - mainDisadvantage: Key weakness (主要劣势)
    - overlap: Functional overlap level (High/Medium/Low) (功能重合度)
    - ourAdvantage: How we win (我们如何胜出)
    
    IMPORTANT: Output everything in Chinese (Simplified).
  `;

  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                coreAdvantage: { type: Type.STRING },
                mainDisadvantage: { type: Type.STRING },
                overlap: { type: Type.STRING },
                ourAdvantage: { type: Type.STRING },
              },
              required: [
                "id",
                "name",
                "coreAdvantage",
                "mainDisadvantage",
                "overlap",
                "ourAdvantage",
              ],
            },
          },
        },
        required: ["summary", "competitors"],
      },
    },
  });

  if (response.text) {
    return res.json(JSON.parse(response.text));
  }
  throw new Error("Failed to generate analysis");
}

async function handleRefineAnalysis({ currentAnalysis, feedback }, res) {
  const context = JSON.stringify(currentAnalysis);

  const prompt = `
    Act as a Senior Product Manager.
    I have an existing Competitive Analysis in JSON format.
    
    Current Analysis:
    ${context}
    
    User Feedback/Request: "${feedback}"
    
    Task: Update the analysis content (summary or competitors list) to satisfy the user's request.
    - If adding a competitor, generate a new ID.
    - Return the full updated JSON structure.
    - Ensure everything is in Chinese (Simplified).
  `;

  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                coreAdvantage: { type: Type.STRING },
                mainDisadvantage: { type: Type.STRING },
                overlap: { type: Type.STRING },
                ourAdvantage: { type: Type.STRING },
              },
              required: [
                "id",
                "name",
                "coreAdvantage",
                "mainDisadvantage",
                "overlap",
                "ourAdvantage",
              ],
            },
          },
        },
        required: ["summary", "competitors"],
      },
    },
  });

  if (response.text) {
    return res.json(JSON.parse(response.text));
  }
  throw new Error("Failed to refine analysis");
}

async function handleGenerateDiagram({ features }, res) {
  const featureList = features.map((f) => `- ${f.name}`).join("\n");

  const prompt = `
    Act as a Senior Business Analyst.
    Create a **Detailed** Mermaid.js flowchart (graph TD) based on these features:
    ${featureList}
    
    Requirements for the Flowchart:
    1. **Complexity**: Create a real business process flow.
    2. **Structure**: Include **Decision Points** (diamond shapes) and **Error Paths**.
    3. **Detail**: The chart should cover end-to-end flows (e.g., Login -> Auth -> Dashboard -> Feature -> DB Update -> Notification).
    
    Return ONLY the raw mermaid code string. Do not include markdown code fences.
    Start the code with "graph TD".
    
    IMPORTANT SYNTAX RULES:
    1. Use Chinese (Simplified) for the node labels.
    2. CRITICAL: You MUST enclose ALL node labels in double quotes.
       Correct: NodeA["用户注册"]
       Incorrect: NodeA[user register]
    3. **CRITICAL: DO NOT USE Double Quotes (") INSIDE the node content.**
       Incorrect: NodeA["显示"错误""]
       Incorrect: NodeA["显示\"错误\""]
       **Correct**: NodeA["显示'错误'"] (Use single quotes or Chinese quotes “”)
    4. CRITICAL: Match your brackets correctly! 
       - For Standard Nodes: use square brackets [ ]. Example: A["开始"]
       - For Decision Nodes: use curly braces { }. Example: B{"验证通过?"}
       - DO NOT MIX brackets. Example INCORRECT: C{"错误"]
    5. CRITICAL: Do NOT use subgraphs. Keep the graph flat to ensure compatibility with the visual editor.
    6. CRITICAL: Put each node definition and link on a NEW LINE.
    7. CRITICAL: Always use spaces around arrows to ensure parser compatibility. Example: A --> B (not A-->B).
    8. Use standard IDs like NodeA, NodeB, etc.
  `;

  const response = await ai.models.generateContent({
    model: modelPro,
    contents: prompt,
  });

  let code = getResponseText(response);
  code = code
    .replace(/```mermaid/g, "")
    .replace(/```/g, "")
    .trim();
  return res.json({ code });
}

async function handleRefineDiagram({ currentCode, feedback }, res) {
  const prompt = `
    Act as a Mermaid.js expert.
    I have an existing Mermaid diagram code.
    
    Current Code:
    ${currentCode}
    
    User Feedback/Request: "${feedback}"
    
    Task: Update the Mermaid code to satisfy the user's request.
    - Maintain valid Mermaid syntax (graph TD).
    - Return ONLY the raw mermaid code string.
    - CRITICAL: Ensure ALL node labels are enclosed in double quotes.
    - **CRITICAL: NO Double Quotes INSIDE labels.** Use single quotes if needed.
    - CRITICAL: Match brackets. [] for Process, {} for Decision. Do not mix them.
    - CRITICAL: Do NOT use subgraphs.
    - CRITICAL: Ensure every statement is on a NEW LINE.
    - CRITICAL: Insert spaces around arrows (e.g., " --> ").
  `;

  const response = await ai.models.generateContent({
    model: modelPro,
    contents: prompt,
  });

  let code = getResponseText(response);
  code = code
    .replace(/```mermaid/g, "")
    .replace(/```/g, "")
    .trim();
  return res.json({ code });
}

async function handleGenerateMindMap(
  { productName, features, userStories },
  res
) {
  const featureList = features
    .map((f) => `- ${f.name}: ${f.description}`)
    .join("\n");
  const storyList = userStories
    .map((s) => `- ${s.role}: ${s.action}`)
    .join("\n");

  const prompt = `
    Act as a Product Architect.
    Create a **Deep and Detailed** Mermaid.js Mindmap for the product "${productName}".
    
    Inputs:
    Features:
    ${featureList}
    
    User Stories:
    ${storyList}
    
    **CRITICAL REQUIREMENT:**
    The mindmap MUST have a depth of at least 3-4 levels. DO NOT create a shallow 1-level map.
    
    Structure it as follows:
    1. **Root**: Product Name
    2. **Branch 1: Core Features** -> Expand each feature into:
       - Sub-feature / Module
       - Specific Functionality
       - UI Component or Data Requirement
    3. **Branch 2: User Roles** -> Expand each role into:
       - Core Goals
       - Specific User Stories/Actions
    4. **Branch 3: Technical Modules** (Optional, if relevant) -> Database, API, etc.

    **CRITICAL SYNTAX RULES:**
    1. Use 2 spaces for indentation strictly.
    2. **WRAP ALL TEXT IN DOUBLE QUOTES**. 
       Example:
       mindmap
         root("Product Name")
           "Feature A"
             "Sub-feature 1"
    3. **DO NOT USE parentheses ( ) or brackets [ ] INSIDE the quoted text.** 
       Incorrect: "Feature (V1)"
       Correct: "Feature - V1"
       If you must use them, use square brackets inside the quotes like "Feature [V1]" but prefer dashes.
    4. Ensure the root node uses round brackets: root("Name")
    
    Return ONLY the raw mermaid code string. 
    Use Chinese (Simplified).
  `;

  const response = await ai.models.generateContent({
    model: modelPro,
    contents: prompt,
  });

  let code = getResponseText(response);
  code = code
    .replace(/```mermaid/g, "")
    .replace(/```/g, "")
    .trim();
  // Ensure it starts with mindmap
  if (!code.trim().startsWith("mindmap")) {
    code = `mindmap\n${code}`;
  }
  return res.json({ code });
}

async function handleRefineMindMap({ currentCode, feedback }, res) {
  const prompt = `
    Act as a Mermaid.js expert.
    I have an existing Mermaid Mindmap code.
    
    Current Code:
    ${currentCode}
    
    User Feedback/Request: "${feedback}"
    
    Task: Update the Mermaid mindmap code.
    - **Maintain or Increase Depth**: Do not flatten the structure.
    - Ensure strict 2-space indentation.
    - **WRAP ALL TEXT IN DOUBLE QUOTES** to prevent syntax errors.
    - **Avoid parentheses () inside text**. Replace with dashes - or square brackets [].
    - Return ONLY the raw mermaid code string.
    - Ensure text is in Chinese (Simplified).
  `;

  const response = await ai.models.generateContent({
    model: modelPro,
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 1024 } },
  });

  let code = getResponseText(response);
  code = code
    .replace(/```mermaid/g, "")
    .replace(/```/g, "")
    .trim();
  return res.json({ code });
}

async function handleGeneratePrototype({ features, description }, res) {
  // Use names only to keep the prompt smaller to avoid RPC errors
  const featureList = features.map((f) => `${f.name}`).join(", ");

    const prompt = `
    Act as a **World-Class Frontend Architect**.
    Create a **High-Fidelity, Single-Page Application (SPA)** prototype.
    
    **Project Context:**
    Description: "${description}"
    Key Features: ${featureList}
    
    **CRITICAL REQUIREMENT: DESKTOP-ONLY WEB DASHBOARD**
    Analyze the description to determine the necessary User Roles.
    - **Flexible Logic**: Do NOT force "Admin" vs "User" if not needed.
      - If it's a B2C tool (e.g., calculator, simple editor), create a **Single View** (No role switcher).
      - If it's a B2B/Platform tool (e.g., CRM, CMS), create **Multiple Views** (e.g., Admin, User) and a "Switch Role" mechanism.
    
    1.  **Architecture (SPA):**
        - **Target Device**: DESKTOP WEB ONLY. Wide screen (1440px+).
        - **Layout**: Sidebar Navigation (Left), Header (Top), Main Content Area (Center).
        - **Role Switching**: **ONLY** if multiple roles are detected, add a dropdown in Header/Sidebar to toggle roles.
    
    2.  **Design System (Modern Minimalist / Apple Style):**
        - **Theme**: Light Mode / Premium Clean. 
          - Background: 'bg-slate-50' or 'bg-white'.
          - Text: 'text-slate-900' (primary), 'text-slate-500' (secondary).
        - **Aesthetics**: "Apple Human Interface" or "Google Material 3" vibe.
          - **Cards**: White bg, subtle shadow ('shadow-sm' or 'shadow-md'), rounded-2xl ('rounded-2xl').
          - **Borders**: Very subtle ('border-slate-200').
        - **Accents**: Use a **Single, Elegant Primary Color** (e.g., Indigo-600, Blue-600, or Violet-600) for buttons and active states. Do NOT use neon gradients.
        - **Typography**: Clean, readable sans-serif (Inter/system-ui).
    
    3.  **Required Functionality (Vanilla JS):**
        - **Navigation**: Clicking sidebar links must update the main content area dynamically.
        - **Interactivity**: 
          - Tabs for switching content.
          - Modals for forms.
          - Toast notifications for actions.
        - **Charts**: Use Chart.js (via CDN) for Analytics where appropriate.
        - **Tables**: Clean, spacious tables with status badges.
    
    4.  **Content Depth:**
        - **Dynamic Views**: Create specific views relevant to the identified logic (Single or Multi-role).
        - **Detailed Features**: Implement the UI for the "Key Features" listed above.
        - **Realistic Data**: Use mock data relevant to the **${description}** industry.
        - **Language**: Chinese (Simplified).

    5.  **CRITICAL SECURITY & STABILITY RULES:**
        - **NO External Links**: Do NOT use <a href="..."> for navigation. It will crash the iframe.
        - **Use OnClick**: For all navigation (Sidebar, Role Switch), use 'onclick="showSection(id)"' or similar.
        - **Safe Anchors**: If you must use <a> tags, set href="javascript:void(0)".
        - **No Page Reloads**: The prototype must never try to reload the page.
    
    **Output Format:**
    - Return a **SINGLE VALID HTML FILE** containing <html>, <head>, <script>, <style>, and <body>.
    - Do NOT markdown wrap.
  `;

  const result = await ai.models.generateContentStream({
    model: modelPro,
    contents: prompt,
  });

  // Streaming response
  for await (const chunk of result) {
    const text = getChunkText(chunk);
    if (text) {
      res.write(text);
    }
  }
  res.end();
}

async function handleRefinePrototype({ currentHtml, feedback }, res) {
  const prompt = `
    Act as a Senior Frontend Engineer (UI/UX Expert).
    I have an existing HTML/Tailwind prototype.
    
    User Feedback/Request: "${feedback}"
    
    Task: Update the HTML code to satisfy the user's request.
    - **Target**: DESKTOP WEB ONLY. Keep it wide and detailed.
    - **Maintain the Design System**: Modern Minimalist, Clean, Apple/Google Style (Light mode, soft shadows).
    - **Maintain Logic**: Do not break existing logical flows (Role switching or Single view).
    - **CRITICAL SECURITY**: Do NOT introduce <a href="..."> links. Use JS onclick for everything. href must be "javascript:void(0)".
    - Return ONLY the raw HTML code.
    - Ensure all new text is in Chinese (Simplified).
    
    Current HTML (truncated context):
    ${currentHtml.slice(0, 30000)} 
  `;

  const result = await ai.models.generateContentStream({
    model: modelPro,
    contents: prompt,
  });

  // Streaming response
  for await (const chunk of result) {
    const text = getChunkText(chunk);
    if (text) {
      res.write(text);
    }
  }
  res.end();
}

// Helper to safely extract text from Gemini chunk
function getChunkText(chunk: any): string {
  if (typeof chunk.text === 'function') {
    return chunk.text();
  }
  if (typeof chunk.text === 'string') {
    return chunk.text;
  }
  if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && chunk.candidates[0].content.parts && chunk.candidates[0].content.parts[0]) {
    return chunk.candidates[0].content.parts[0].text || '';
  }
  return '';
}

// Helper to safely extract text from Gemini response (non-stream)
function getResponseText(response: any): string {
  if (typeof response.text === 'function') {
    return response.text();
  }
  if (typeof response.text === 'string') {
    return response.text;
  }
  if (response.response && typeof response.response.text === 'function') {
      return response.response.text();
  }
  return '';
}

async function handleChat({ history, message }, res) {
  const chat = ai.chats.create({
    model: modelFlash,
    config: {
      systemInstruction:
        "You are a helpful Product Manager Assistant. You can help answer questions about product design, market research, technical feasibility, or general inquiries. Answer concisely and in Chinese (Simplified).",
    },
    history: history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessage({ message });
  return res.json({
    text: getResponseText(result) || "Sorry, I couldn't generate a response.",
  });
}
