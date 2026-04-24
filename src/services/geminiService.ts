import { GoogleGenAI, Type } from "@google/genai";
import { shadowWatchdog } from "./multiAgentService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const systemInstruction = `You are COOK IA, a world-class senior web engineer and elite product designer. 
Your mission is to transform even the simplest user prompt into a "magnificent", high-end, and fully functional website that feels like a premium digital product.

PROACTIVE GUIDANCE & TECHNICAL SUPPORT:
- If you notice missing configurations, API keys, or steps required for a feature to work (e.g., Supabase setup, Stripe keys), you MUST inform the user and provide clear instructions on how to resolve it.
- Remind the user that they can store sensitive keys in the "Secrets" section of the settings.
- You are authorized to answer technical questions related to website development, such as providing Supabase SQL snippets, explaining data persistence, or debugging code.

ADVANCED CODING CAPABILITIES:
- IMAGE-TO-CODE & COLOR EXTRACTION: You can generate high-fidelity code from an uploaded image. Analyze the image to extract its color palette, typography, and layout to replicate or adapt it perfectly.
- MULTI-PAGE ARCHITECTURE: You MUST ALWAYS create a complete website with separate pages (index.html, about.html, contact.html, etc.) that are NOT just sections on the home page. Use a robust client-side routing system or dynamic section switching for the preview.
- FOCUS MODE: When Focus Mode is active (or implied by the user's request for a "complete site"), you must generate a fully functional, production-ready website from even a simple prompt. Every feature, link, and button must work.
- WEBSITE CLONING: You can clone an existing website from a URL. Use the 'urlContext' tool to analyze the structure, assets, and content of the source site to create a faithful clone or an improved version.
- You have absolute mastery of modern web technologies: HTML5, CSS3, JavaScript (ES6+), React, and Python (Flask/FastAPI).
- You are an expert in high-end libraries: Three.js (3D scenes, shaders), GSAP (complex timelines), Framer Motion (smooth UI transitions), Chart.js/D3.js (data viz).
- You can generate full-stack architectures including a Python backend if requested.
- You can process video files to extract spatial information and generate immersive 3D scenes using Three.js or React Three Fiber.
- You can analyze video content to create synchronized, high-end animations and transitions (GSAP, Framer Motion) that match the movement or rhythm of the video.
- You can build professional, enterprise-grade architectures: modular, responsive, and accessible.
- You can analyze up to 20 reference images or use Unsplash URLs provided in the prompt to replace generic images with professional photography.
- You have access to the 'urlContext' tool. When a URL is provided, use it to extract real content, images, and data to populate the website.
- Always prioritize using the specific Unsplash URLs or images extracted from the provided URL context.

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
     - Entrance animations (fade-in, slide-up, scale-in) on all major sections and elements.
     - "Camera Follow Forward" effect: Implement a subtle zoom-in or parallax effect that simulates a camera moving forward as the user scrolls or on page load.
     - Smooth scroll, and parallax.
     - Micro-interactions on every interactive element.

4. CONTENT & DETAIL:
   - NEVER use "Lorem Ipsum". Generate realistic, compelling copy.
   - Include detailed sections: Hero, Features, About, Testimonials, Pricing, FAQ, and Contact.

5. TECHNICAL EXCELLENCE & MULTI-PAGE ARCHITECTURE:
   - You MUST ALWAYS output a structured project with multiple files and multiple pages (index.html, about.html, contact.html, etc.).
   - You code like a world-class engineer: modular, clean, and highly scalable.
   - The project structure SHOULD include:
     - A modern multi-page HTML/CSS/JS version.
     - A React component version with routing (App.jsx, components/, pages/).
     - A Python backend structure (app.py) if the site requires any data handling or forms.
     - A README.md file.
   - The README.md MUST explicitly state: "Ce site a été créé avec COOK IA, l'IA de création web."
   - Also provide a 'preview_code' which is a single, self-contained HTML string. To simulate multiple pages in the preview, use a robust client-side routing system or dynamic section switching.
   - Use modern patterns: CSS Variables, Flexbox/Grid, ES6 Modules, and high-performance animations.

6. MANDATORY BADGE:
   - You MUST ALWAYS include a small, elegant badge at the bottom right of the page (fixed position).
   - The badge should say "Créé avec COOK IA" with the logo.
   - Example style: <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; z-index: 9999; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px); display: flex; items-center: center; gap: 8px; font-family: sans-serif; cursor: pointer;" onclick="window.open('https://cook-ia.indevs.in/', '_blank')"><img src="https://i.ibb.co/mC3M8SSN/logo.png" style="width: 16px; height: 16px; object-fit: contain;">Créé avec COOK IA</div>

Return the response EXCLUSIVELY in JSON format with three fields (do not include any other text outside the JSON):
1. 'explanation': A brief, professional description of the architectural and design choices made.
2. 'preview_code': The complete, production-ready single-file HTML/CSS/JS code for immediate preview.
3. 'files': An array of objects, each with 'path' (e.g., "src/index.html") and 'content' (the file content).`;

const generateWithAIFallback = async (
  prompt: string,
  history: any[],
  images?: { mimeType: string, data: string }[]
) => {
  console.debug("[Fallback] Gemini is unresponsive. Switching to fallback...");

  const response = await fetch("/api/ai/fallback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      history,
      images
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`AI Fallback Error: ${err.error || response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export const convertToReact = async (htmlCode: string, framework: 'react' | 'nextjs' | 'python' | 'javascript') => {
  const model = "gemini-3-flash-preview";
  let targetPrompt = "";
  
  if (framework === 'react' || framework === 'nextjs') {
    targetPrompt = `CONVERT THIS HTML/CSS/JS CODE TO ${framework.toUpperCase()} COMPONENTS WITH TAILWIND CSS:
\`\`\`html
${htmlCode}
\`\`\`

INSTRUCTIONS:
1. Break the code into logical, reusable components.
2. Use Tailwind CSS for all styling.
3. If there are animations (GSAP/Framer Motion), implement them using the appropriate React hooks/libraries.
4. Ensure the code is clean, typed with TypeScript, and follows best practices.
5. Return the result as a JSON object with a 'files' array, where each file has a 'path' and 'content'.`;
  } else if (framework === 'python') {
    targetPrompt = `CONVERT THIS HTML/CSS/JS CODE TO A FULL-STACK PYTHON (FLASK) APPLICATION:
\`\`\`html
${htmlCode}
\`\`\`

INSTRUCTIONS:
1. Create a Flask app structure (app.py, templates/index.html, static/css, static/js).
2. Ensure the HTML is properly templated (Jinja2).
3. Include a README.md explaining how to run the app.
4. Return the result as a JSON object with a 'files' array, where each file has a 'path' and 'content'.`;
  } else if (framework === 'javascript') {
    targetPrompt = `CONVERT THIS SINGLE-FILE HTML CODE TO A MODULAR JAVASCRIPT PROJECT:
\`\`\`html
${htmlCode}
\`\`\`

INSTRUCTIONS:
1. Separate HTML, CSS, and JS into individual files.
2. Use modern ES6 modules for JavaScript.
3. Include a package.json and a README.md.
4. Return the result as a JSON object with a 'files' array, where each file has a 'path' and 'content'.`;
  }

  // Silent Fallback
  if (!shadowWatchdog.isHealthy()) {
    return await generateWithAIFallback(targetPrompt, []);
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{
          text: targetPrompt
        }]
      }],
      config: {
        systemInstruction: "You are a world-class full-stack developer.",
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
    shadowWatchdog.setUnhealthy();
    console.debug("Error converting code, trying fallback:", error);
    return await generateWithAIFallback(targetPrompt, []);
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
  const model = "gemini-3-flash-preview";
  const systemInstruction = "You are an expert web developer specializing in targeted component updates.";
  const userPrompt = `TARGET SECTION HTML:
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
Return the result in JSON format with two fields:
1. 'explanation': What you changed.
2. 'updated_section_html': The new HTML for that section only.`;

  if (!shadowWatchdog.isHealthy()) {
    return await generateWithAIFallback(userPrompt, history);
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { 
          role: "user", 
          parts: [{ 
            text: userPrompt
          }] 
        }
      ],
      config: {
        systemInstruction,
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
    shadowWatchdog.setUnhealthy();
    console.debug("Error updating section, trying fallback:", error);
    return await generateWithAIFallback(userPrompt, history);
  }
};

export const generateWebsite = async (
  prompt: string, 
  history: { role: "user" | "model", parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[],
  images?: { mimeType: string, data: string }[],
  videos?: { mimeType: string, data: string }[]
) => {
  // Silent Fallback Protocol: If primary is unhealthy, go straight to fallback
  if (!shadowWatchdog.isHealthy()) {
    console.log("[Shadow Watchdog] Engineering skipping Gemini due to health state.");
    return await generateWithAIFallback(prompt, history, images);
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key missing");
    }

    const model = "gemini-3-flash-preview";
    
    // Log the coding session in the background (Watchdog)
    fetch("/api/watchdog/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "session_log",
        payload: {
          prompt: prompt.substring(0, 100),
          timestamp: new Date().toISOString(),
          context: "Website Generation"
        }
      })
    }).catch(err => console.error("[Watchdog] Failed to log session:", err));

    const userParts: any[] = [{ text: prompt }];
    if (images && images.length > 0) {
      images.forEach(img => {
        userParts.push({
          inlineData: img
        });
      });
    }
    if (videos && videos.length > 0) {
      videos.forEach(vid => {
        userParts.push({
          inlineData: vid
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
        tools: [{ urlContext: {} }],
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const result = JSON.parse(jsonStr);
    return { ...result, _provider: 'gemini' };
  } catch (error) {
    shadowWatchdog.setUnhealthy();
    console.debug("Gemini failed, trying fallback chain:", error);
    return await generateWithAIFallback(prompt, history, images);
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
    console.debug("Gemini Title generation failed:", error);
    return "New Website";
  }
};
