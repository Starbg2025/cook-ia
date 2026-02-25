import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const systemInstruction = `You are COOK IA, a world-class senior web engineer. 
Your task is to generate high-quality, ultra-modern, and functional websites based on user prompts and optional reference images.
You are authorized and encouraged to use ALL types of modern web code to create the best possible experience:
- HTML5 (Semantic structure)
- CSS3 (Custom animations, gradients, complex layouts, 3D transforms)
- Tailwind CSS (via CDN: https://cdn.tailwindcss.com)
- JavaScript (ES6+, interactivity, state management if needed)
- Advanced Interactivity & 3D:
  - Framer Motion / GSAP for high-end animations and scroll-triggered effects
  - Three.js for immersive 3D elements, particle systems, or 3D scenes if requested or appropriate
  - Canvas API for custom drawing or generative art
- External Libraries (via CDN):
  - Lucide Icons / FontAwesome for iconography
  - Google Fonts for professional typography (Inter, Space Grotesk, Playfair Display, etc.)
  - Chart.js / D3.js for data visualization if relevant

If the user provides an image, analyze its layout, color palette, and style to recreate a similar or improved version as a functional website.

The output MUST be a single, self-contained HTML string.
Focus on:
- 'Bento Grid' and 'Editorial' layouts
- Glassmorphism, Neumorphism, and Brutalist design styles
- Immersive interactions and micro-animations
- Full responsiveness (Mobile, Tablet, Desktop)
- Accessibility (Aria labels, contrast)

Return the response in JSON format with two fields:
1. 'explanation': A brief description of what you built.
2. 'code': The complete HTML/CSS/JS code.`;

const generateWithOpenRouter = async (
  prompt: string,
  history: any[],
  image?: { mimeType: string, data: string }
) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("Gemini a échoué et aucune clé OpenRouter n'est configurée pour le relais.");
  }

  console.log("[Fallback] Using OpenRouter...");

  const messages = [
    { role: "system", content: systemInstruction },
    ...history.map(h => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts[0].text
    }))
  ];

  const userContent: any[] = [{ type: "text", text: prompt }];
  if (image) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${image.mimeType};base64,${image.data}`
      }
    });
  }

  messages.push({ role: "user", content: userContent as any });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "COOK IA",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-lite-preview-02-05:free",
      messages,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenRouter Error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
};

export const generateWebsite = async (
  prompt: string, 
  history: { role: "user" | "model", parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[],
  image?: { mimeType: string, data: string }
) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key missing");
    }

    const model = "gemini-3-flash-preview";
    
    const userParts: any[] = [{ text: prompt }];
    if (image) {
      userParts.push({
        inlineData: image
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: "user", parts: userParts }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            code: { type: Type.STRING }
          },
          required: ["explanation", "code"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini failed, trying OpenRouter fallback:", error);
    return await generateWithOpenRouter(prompt, history, image);
  }
};

export const generateTitle = async (prompt: string) => {
  try {
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a very short, catchy title (max 4 words) for a website project based on this prompt: "${prompt}". Return only the title text.`,
    });
    return response.text?.trim() || "New Website";
  } catch (error) {
    console.error("Gemini Title generation failed:", error);
    return "New Website";
  }
};
