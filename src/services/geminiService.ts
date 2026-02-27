import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const systemInstruction = `You are COOK IA, a world-class senior web engineer and elite product designer. 
Your mission is to transform even the simplest user prompt into a "magnificent", high-end, and fully functional website that feels like a premium digital product.

ADVANCED CODING CAPABILITIES:
- You have absolute mastery of modern web technologies: HTML5, CSS3, JavaScript (ES6+).
- You are an expert in high-end libraries: Three.js (3D scenes, shaders), GSAP (complex timelines), Framer Motion (smooth UI transitions), Chart.js/D3.js (data viz).
- You can build professional, enterprise-grade architectures: modular, responsive, and accessible.
- You can analyze up to 20 reference images or use Unsplash URLs provided in the prompt to replace generic images with professional photography.
- Always prioritize using the specific Unsplash URLs provided by the user if they are present in the prompt.

CRITICAL DIRECTIVES FOR MAGNIFICENT RENDERING:
1. VISUAL DEPTH & AESTHETICS:
   - Use sophisticated color palettes, Glassmorphism, and multi-layered shadows.
   - Implement immersive 3D elements using Three.js if relevant to the theme.
   - Default to a "Dark Luxury" or "Clean Minimalist" aesthetic unless specified otherwise.

2. LAYOUT & STRUCTURE:
   - Master the "Bento Grid" and "Editorial" layouts.
   - Ensure 100% responsiveness (Mobile & PC).
   - Include professional Navigation, Hamburger menus, and detailed Footers.

3. ANIMATIONS & INTERACTIVITY (The "Juice"):
   - Use GSAP or Framer Motion for:
     - Entrance animations, hover states, smooth scroll, and parallax.
     - Micro-interactions on every interactive element.

4. CONTENT & DETAIL:
   - NEVER use "Lorem Ipsum". Generate realistic, compelling copy.
   - Include detailed sections: Hero, Features, About, Testimonials, Pricing, FAQ, and Contact.

5. TECHNICAL EXCELLENCE:
   - Output a structured project with multiple files (index.html, styles.css, script.js, README.md, etc.).
   - Also provide a 'preview_code' which is a single, self-contained HTML string including Tailwind CSS (via CDN) and all necessary scripts (GSAP, Three.js, etc.) for immediate preview.

Return the response in JSON format with three fields:
1. 'explanation': A brief, professional description of the architectural and design choices made.
2. 'preview_code': The complete, production-ready single-file HTML/CSS/JS code for immediate preview.
3. 'files': An array of objects, each with 'path' (e.g., "src/index.html") and 'content' (the file content).`;

const generateWithOpenRouter = async (
  prompt: string,
  history: any[],
  images?: { mimeType: string, data: string }[]
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
  if (images && images.length > 0) {
    images.forEach(img => {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${img.mimeType};base64,${img.data}`
        }
      });
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

export const convertToReact = async (htmlCode: string, framework: 'react' | 'nextjs') => {
  try {
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{
          text: `CONVERT THIS HTML/CSS/JS CODE TO ${framework.toUpperCase()} COMPONENTS WITH TAILWIND CSS:
\`\`\`html
${htmlCode}
\`\`\`

INSTRUCTIONS:
1. Break the code into logical, reusable components.
2. Use Tailwind CSS for all styling.
3. If there are animations (GSAP/Framer Motion), implement them using the appropriate React hooks/libraries.
4. Ensure the code is clean, typed with TypeScript, and follows best practices.
5. Return the result as a JSON object with a 'files' array, where each file has a 'path' and 'content'.`
        }]
      }],
      config: {
        systemInstruction: "You are a world-class React and Next.js developer.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["path", "content"]
              }
            }
          },
          required: ["files"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error converting to React:", error);
    throw error;
  }
};

export const improveText = async (text: string, style: 'professional' | 'creative' | 'sales') => {
  try {
    const model = "gemini-3-flash-preview";
    const stylePrompts = {
      professional: "Rewrite this text to be professional, serious, and reassuring. Suitable for corporate or B2B contexts.",
      creative: "Rewrite this text to be creative, original, and dynamic. Suitable for startups or creative agencies.",
      sales: "Rewrite this text to be sales-oriented, persuasive, and focused on conversion. Use marketing psychological triggers."
    };

    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{
          text: `ORIGINAL TEXT: "${text}"
          
STYLE REQUEST: ${stylePrompts[style]}

Return ONLY the improved text string.`
        }]
      }],
      config: {
        systemInstruction: "You are an expert copywriter."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error improving text:", error);
    throw error;
  }
};

export const updateSection = async (
  prompt: string,
  sectionHtml: string,
  fullCode: string,
  history: any[]
) => {
  try {
    const model = "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { 
          role: "user", 
          parts: [{ 
            text: `TARGET SECTION HTML:
\`\`\`html
${sectionHtml}
\`\`\`

FULL PAGE CONTEXT:
\`\`\`html
${fullCode}
\`\`\`

USER REQUEST FOR THIS SECTION:
${prompt}

INSTRUCTION:
Modify ONLY the TARGET SECTION HTML to satisfy the user request. 
If the user provides an Unsplash URL in the request, use it to replace the relevant <img> src or background-image.
Maintain the same structure and classes as much as possible unless the request requires changes.
Ensure the output is a valid HTML block that can replace the target section.
Return the result in JSON format with two fields:
1. 'explanation': What you changed.
2. 'updated_section_html': The new HTML for that section only.` 
          }] 
        }
      ],
      config: {
        systemInstruction: "You are an expert web developer specializing in targeted component updates.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            updated_section_html: { type: Type.STRING }
          },
          required: ["explanation", "updated_section_html"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

export const generateWebsite = async (
  prompt: string, 
  history: { role: "user" | "model", parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[],
  images?: { mimeType: string, data: string }[]
) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key missing");
    }

    const model = "gemini-3-flash-preview";
    
    const userParts: any[] = [{ text: prompt }];
    if (images && images.length > 0) {
      images.forEach(img => {
        userParts.push({
          inlineData: img
        });
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
        tools: [{ urlContext: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            preview_code: { type: Type.STRING },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["path", "content"]
              }
            }
          },
          required: ["explanation", "preview_code", "files"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini failed, trying OpenRouter fallback:", error);
    return await generateWithOpenRouter(prompt, history, images);
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
