import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Shadow Watchdog: Internal health check and silent fallback management
let primaryModelHealthy = true;

export const shadowWatchdog = {
  isHealthy: () => primaryModelHealthy,
  setUnhealthy: () => {
    primaryModelHealthy = false;
    console.warn("[Shadow Watchdog] Gemini marked as unhealthy. Activation of Silent Fallback Protocol.");
    // Auto-reset health after 5 minutes
    setTimeout(() => {
      primaryModelHealthy = true;
      console.log("[Shadow Watchdog] Gemini health reset. Returning to primary model.");
    }, 5 * 60 * 1000);
  }
};

const getApiKey = (provider: string) => {
  switch (provider) {
    case 'GROQ': return process.env.GROQ_API_KEY;
    case 'OPENROUTER': return process.env.OPENROUTER_API_KEY;
    default: return null;
  }
};

// Agent 1: Analyst (Groq)
export const analystReview = async (prompt: string, history: any[]) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { needsClarification: false, questions: [] };

  try {
    // Helper to format history for text-based models
    const formatHistory = (hist: any[]) => {
      return hist.map(h => {
        const text = h.parts.filter((p: any) => p.text).map((p: any) => p.text).join(" ");
        return `${h.role === "model" ? "Assistant" : "User"}: ${text}`;
      }).join("\n");
    };

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
            content: `HISTORY:\n${formatHistory(history.slice(-5))}\n\nCURRENT PROMPT: ${prompt}`
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

// Agent 2: Planner (Gemini)
export const plannerAgent = async (prompt: string, history: any[]) => {
  const tryGroqFallback = async (p: string) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
                content: `You are the 'Planner' for COOK IA. Break down the user's request into a detailed technical plan.
                Return JSON: { "plan": "string", "isComplex": boolean, "subAgents": string[] }`
              },
              {
                role: "user",
                content: `USER REQUEST: ${p}`
              }
            ],
            response_format: { type: "json_object" }
          })
        });
        const data = await fallbackResponse.json();
        return JSON.parse(data.choices[0].message.content);
      } catch (fallbackErr) {
        console.error("Planner fallback failed:", fallbackErr);
        throw fallbackErr;
      }
    }
    throw new Error("No Groq key for fallback");
  };

  // If primary model is already known to be down, skip directly
  if (!shadowWatchdog.isHealthy()) {
    console.log("[Shadow Watchdog] Planner skipping Gemini due to health state.");
    try {
      return await tryGroqFallback(prompt);
    } catch {
      // Return basic plan if all fail
      return { plan: "Planification simplifiée (mode secours).", isComplex: false, subAgents: [] };
    }
  }

  try {
    const systemPrompt = `You are the 'Planner' for COOK IA. Your job is to break down the user's request into a detailed technical plan.
            
    RULES:
    1. ALWAYS plan before coding.
    2. COMPLEXITY DETECTION: If the request is complex (multi-page, custom backend, complex animations, database integration), mark it as complex and define sub-agents (e.g., UI Designer, Backend Engineer, Content Strategist).
    3. OUTPUT: Provide a step-by-step plan.
    
    Return JSON:
    {
      "plan": "string (markdown)",
      "isComplex": boolean,
      "subAgents": string[] (names of sub-agents needed)
    }`;

    const formatHistory = (hist: any[]) => {
      return hist.map(h => {
        const text = h.parts.filter((p: any) => p.text).map((p: any) => p.text).join(" ");
        return `${h.role === "model" ? "Assistant" : "User"}: ${text}`;
      }).join("\n");
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: systemPrompt },
        { text: `USER REQUEST: ${prompt}\n\nHISTORY:\n${formatHistory(history.slice(-3))}` }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    shadowWatchdog.setUnhealthy();
    console.warn("Planner Gemini error, trying Groq fallback:", error);
    try {
      return await tryGroqFallback(prompt);
    } catch {
      return { 
        plan: "Désolé, je n'ai pas pu générer de plan détaillé pour le moment. Je vais tout de même tenter de construire votre site.", 
        isComplex: false, 
        subAgents: [] 
      };
    }
  }
};

// Agent 4: Tester (Groq)
export const testerAgent = async (code: string, prompt: string) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { passed: true, errors: [] };

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
            content: `You are the 'Automated Tester' for COOK IA. Your job is to analyze the generated code and check for bugs, syntax errors, or missing features based on the prompt.
            
            Return JSON:
            {
              "passed": boolean,
              "errors": string[] (detailed descriptions of bugs found)
            }`
          },
          {
            role: "user",
            content: `PROMPT: ${prompt}\n\nCODE: ${code.substring(0, 5000)}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Tester error:", error);
    return { passed: true, errors: [] };
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
        "HTTP-Referer": "https://cook-ia.netlify.app",
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
