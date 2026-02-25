import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateWebsite = async (
  prompt: string, 
  history: { role: "user" | "model", parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[],
  image?: { mimeType: string, data: string }
) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("La clé API Gemini est manquante. Vérifiez vos variables d'environnement.");
  }

  const model = "gemini-3-flash-preview";
  
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
};

export const generateTitle = async (prompt: string) => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a very short, catchy title (max 4 words) for a website project based on this prompt: "${prompt}". Return only the title text.`,
  });
  return response.text?.trim() || "New Website";
};
