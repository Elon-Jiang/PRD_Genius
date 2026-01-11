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
       Incorrect: NodeA[用户注册]
    3. CRITICAL: Match your brackets correctly! 
       - For Standard Nodes: use square brackets [ ]. Example: A["开始"]
       - For Decision Nodes: use curly braces { }. Example: B{"验证通过?"}
       - DO NOT MIX brackets. Example INCORRECT: C{"错误"]
    4. CRITICAL: Do NOT use subgraphs. Keep the graph flat to ensure compatibility with the visual editor.
    5. CRITICAL: Put each node definition and link on a NEW LINE.
    6. CRITICAL: Always use spaces around arrows to ensure parser compatibility. Example: A --> B (not A-->B).
    7. Use standard IDs like NodeA, NodeB, etc.
  `;

  const response = await ai.models.generateContent({
    model: modelPro,
    contents: prompt,
  });

  let code = response.text || "";
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
    - CRITICAL: Match brackets. [] for Process, {} for Decision. Do not mix them.
    - CRITICAL: Do NOT use subgraphs.
    - CRITICAL: Ensure every statement is on a NEW LINE.
    - CRITICAL: Insert spaces around arrows (e.g., " --> ").
  `;

  const response = await ai.models.generateContent({
    model: modelPro,
    contents: prompt,
  });

  let code = response.text || "";
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

  let code = response.text || "";
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

  let code = response.text || "";
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
    Analyze the description to identify at least 2-3 key User Roles (e.g., User, Admin, etc.) specific to this product.
    You MUST create a **Multi-View System** contained in a single HTML file that allows switching between these roles.
    
    1.  **Architecture (SPA):**
        - **Target Device**: DESKTOP WEB ONLY. Do NOT implement mobile hamburgers or responsive collapsing logic unless absolutely necessary for layout. Assume a wide screen (1440px+).
        - **Layout**: Sidebar Navigation (Left), Header (Top), Main Content Area (Center).
        - **Role Switching**: Implement a prominent "Switch Role" dropdown in the Header or Sidebar to toggle between the identified roles instantly.
    
    2.  **Design System (Dark Tech / Dia Browser Style):**
        - **Theme**: Dark Mode default. Use 'bg-slate-900', 'text-slate-100'.
        - **Glassmorphism**: Use 'bg-white/5', 'backdrop-blur-xl', 'border-white/10'.
        - **Accents**: Neon gradients (blue/purple/cyan) for active states.
        - **Components**: Rounded corners (rounded-xl), subtle shadows, floating cards.
    
    3.  **Required Functionality (Vanilla JS):**
        - **Navigation**: Clicking sidebar links must update the main content area dynamically.
        - **Interactivity**: 
          - Tabs for switching content.
          - Modals for forms.
          - Toast notifications for actions (e.g., "Saved successfully").
        - **Charts**: Use Chart.js (via CDN) for Analytics dashboards where appropriate.
        - **Tables**: Create detailed, realistic data tables with status badges and action buttons.
    
    4.  **Content Depth:**
        - **Dynamic Roles**: For each identified role, create specific views and dashboards relevant to their tasks.
        - **Detailed Features**: Implement the UI for the "Key Features" listed above.
        - **Realistic Data**: Use mock data relevant to the **${description}** industry. No "Lorem Ipsum".
        - **Language**: Chinese (Simplified).

    5. **CRITICAL SECURITY & STABILITY RULES:**
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
    res.write(chunk.text());
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
    - **Maintain the High-Fidelity Dark Tech Style**: Keep glassmorphism, neon accents.
    - **Maintain Multi-Role Logic**: Do not break the JavaScript role switching logic.
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
    res.write(chunk.text());
  }
  res.end();
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
    text: result.text || "Sorry, I couldn't generate a response.",
  });
}
