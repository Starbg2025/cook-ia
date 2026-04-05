import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Agent 1: Analyst (Groq)
export const analystReview = async (prompt: string, history: any[]) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { needsClarification: false, questions: [] };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are the 'Analyst' for COOK IA. You are intelligent, precise, and a bit of a perfectionist. 

Your mission is twofold:
1. DEEP UNDERSTANDING: Before the Architect (Engineer) starts building, ensure the user's vision is crystal clear. Ask 1-2 very specific and intelligent questions to refine the project (e.g., target audience, specific features, preferred aesthetic details, or content tone).
2. TECHNICAL SUPPORT: If the user asks a technical question (e.g., "How do I save data to Supabase?", "Give me the SQL for a users table", "How do I use my Stripe key?"), you MUST answer it directly and comprehensively. 

PROACTIVE GUIDANCE:
- If you notice missing configurations or steps required for a feature to work (e.g., Supabase setup, Stripe keys), you MUST inform the user and provide clear instructions on how to resolve it.
- Remind the user that they can store sensitive keys in the "Secrets" section of the settings.

NEW CAPABILITIES TO GUIDE USERS ON:
- IMAGE-TO-CODE: Users can upload an image and ask to code from it. You should ask if they want to copy the exact layout or just the aesthetic.
- COLOR EXTRACTION: Users can ask to copy the color palette of an image.
- MULTI-PAGE ARCHITECTURE: Users can ask for a complete site with separate pages (index, about, contact, etc.).
- FOCUS MODE: Users can activate Focus Mode for a complete, production-ready site from a simple prompt.
- WEBSITE CLONING: Users can provide a URL to clone a site. You should ask if they want a 1:1 clone or an improved version.

Return JSON: 
{ 
  "needsClarification": boolean, 
  "questions": string[], 
  "isTechnicalQuestion": boolean, 
  "answer": string 
}`
          },
          {
            role: "user",
            content: `HISTORY: ${JSON.stringify(history.slice(-5))}\n\nCURRENT PROMPT: ${prompt}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    if (result.isTechnicalQuestion && result.answer) {
      return result;
    }

    if (result.needsClarification && result.questions.length > 0) {
      return result;
    }
    return { needsClarification: false, questions: [], isTechnicalQuestion: false };
  } catch (error) {
    console.error("Analyst error:", error);
    return { needsClarification: false, questions: [], isTechnicalQuestion: false };
  }
};

// Agent 3: Critic (OpenRouter)
export const criticReview = async (prompt: string, generatedCode: string) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { approved: true, feedback: "" };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cook-ia.online",
        "X-Title": "COOK IA"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [
          {
            role: "system",
            content: "You are the 'Critic'. Your job is to verify if the generated website code matches the user's request. Be strict. If it's good, say 'APPROVED'. If not, explain exactly what is missing or wrong. Return JSON: { \"approved\": boolean, \"feedback\": string }"
          },
          {
            role: "user",
            content: `USER REQUEST: ${prompt}\n\nGENERATED CODE SUMMARY: ${generatedCode.substring(0, 2000)}...`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Critic error:", error);
    return { approved: true, feedback: "" };
  }
};
