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
            content: "You are the 'Analyst' egg avatar. Your job is to ensure the user's request for a website is clear. If the prompt is vague (e.g., just 'a bakery site'), ask 1-2 very specific questions to help the Engineer build a better site. If it's clear, just say 'CLEAR'. Return JSON: { \"needsClarification\": boolean, \"questions\": string[] }"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    if (result.needsClarification && result.questions.length > 0) {
      return result;
    }
    return { needsClarification: false, questions: [] };
  } catch (error) {
    console.error("Analyst error:", error);
    return { needsClarification: false, questions: [] };
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
            content: "You are the 'Critic' egg avatar. Your job is to verify if the generated website code matches the user's request. Be strict. If it's good, say 'APPROVED'. If not, explain exactly what is missing or wrong. Return JSON: { \"approved\": boolean, \"feedback\": string }"
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
