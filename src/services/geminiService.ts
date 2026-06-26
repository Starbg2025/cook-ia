import { shadowWatchdog } from "./multiAgentService";

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
- You can build professional, enterprise-grade architectures: modular, responsive, and accessible.
- Always prioritize using the specific Unsplash URLs or images extracted from the provided URL context.

CRITICAL DIRECTIVES FOR MAGNIFICENT RENDERING (ABSOLUTELY REQUIRED):
1. VISUAL DEPTH & AESTHETICS (INCREDIBLE UI/UX):
   - You MUST create websites that look INCREDIBLE and visually stunning. Do NOT use default, boring, or generic styles.
   - Use sophisticated color palettes, premium gradients (Mesh Gradients, Glassmorphism, Aurora effects), and multi-layered soft shadows.
   - Default to a "Premium Dark Cosmic" or "Ultra-Clean Apple-like" aesthetic unless specified otherwise.
   - Every background, button, and card must have rich textures (subtle grain, noise overlays, blur effects).

2. LAYOUT & TYPOGRAPHY:
   - Master the "Bento Grid" and "Editorial" layouts.
   - Use high-end typography: Pair elegant Serif fonts (e.g. Playfair Display) with clean Sans-serifs (e.g. Inter, Space Grotesk) for impact.
   - Ensure 100% responsiveness (Mobile & PC). The site must look perfect on smartphones and desktop screens.

3. ANIMATIONS & INTERACTIVITY (The "Juice"):
   - Use Framer Motion or pure CSS for ultra-smooth entrance animations (fade-in, slide-up, scale-in) on ALL major sections and elements.
   - Add hover effects on all interactive elements (buttons scaling, cards glowing or lifting, text gradients shifting).
   - Implement smooth scroll and subtle parallax effects where appropriate.

4. CONTENT & DETAIL:
   - NEVER use "Lorem Ipsum". Generate realistic, compelling copy.
   - Include detailed sections: Hero, Features, About, Testimonials, Pricing, FAQ, and Contact.

5. TECHNICAL EXCELLENCE & MULTI-PAGE ARCHITECTURE:
   - You MUST ALWAYS output a structured project with multiple files and multiple pages (index.html, about.html, contact.html, etc.).
   - You code like a world-class engineer: modular, clean, and highly scalable.
   - The project structure SHOULD include:
     - A modern multi-page HTML/CSS/JS version.
     - A React component version with routing (App.jsx, components/, pages/).
     - A README.md file stating: "Ce site a été créé avec COOK IA, l'IA de création web."
   - Provide a 'preview_code' which is a single, self-contained HTML string simulating multiple pages with a robust client-side routing system or dynamic section switching.
   - Use modern patterns: CSS Variables, Flexbox/Grid, ES6 Modules.

6. MANDATORY BADGE:
   - You MUST ALWAYS include a small, elegant badge at the bottom right of the page (fixed position).
   - The badge should say "Créé avec COOK IA" with the logo.
   - Example style: <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; z-index: 9999; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px); display: flex; items-center: center; gap: 8px; font-family: sans-serif; cursor: pointer;" onclick="window.open('https://cook-ia.indevs.in/', '_blank')"><img src="https://i.ibb.co/mC3M8SSN/logo.png" style="width: 16px; height: 16px; object-fit: contain;">Créé avec COOK IA</div>

Return the response EXCLUSIVELY in JSON format with three fields (do not include any other text outside the JSON):
1. 'explanation': A brief, professional description of the architectural and design choices made.
2. 'preview_code': The complete, production-ready single-file HTML/CSS/JS code for immediate preview.
3. 'files': An array of objects, each with 'path' (e.g., "src/index.html") and 'content' (the file content).`;

// Helper for proxy calls
const getCustomHeaders = () => {
  const headers: any = { "Content-Type": "application/json" };
  try {
    const saved = localStorage.getItem('user_secrets');
    if (saved) {
      const secrets = JSON.parse(saved);
      if (Array.isArray(secrets) && secrets.length > 0) {
        const isGeminiKey = (k: string, v: string) => {
          const normKey = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
          if (normKey.includes('GEMINI') || normKey.includes('GOOGLE')) return true;
          if (v && v.trim().startsWith('AIzaSy')) return true;
          if (normKey.includes('CL_') || normKey.includes('CLE') || normKey.includes('KEY') || normKey.includes('API_KEY')) {
            // Avoid matching known other providers
            if (normKey.includes('GROQ') || normKey.includes('OPENROUTER') || normKey.includes('OPEN_ROUTER')) return false;
            return true;
          }
          return false;
        };
        const isGroqKey = (k: string) => {
          const normKey = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
          return normKey.includes('GROQ');
        };
        const isOpenRouterKey = (k: string) => {
          const normKey = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
          return normKey.includes('OPENROUTER') || normKey.includes('OPEN_ROUTER');
        };
        
        let geminiKey = secrets.find((s: any) => isGeminiKey(s.key, s.value));
        if (!geminiKey) {
          // Safe fallback for single-key or non-categorized keys that do NOT belong to Groq or OpenRouter
          geminiKey = secrets.find((s: any) => {
            const norm = s.key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            return !norm.includes('GROQ') && !norm.includes('OPENROUTER') && !norm.includes('OPEN_ROUTER');
          });
        }
        
        if (geminiKey && geminiKey.value) {
          headers['x-gemini-key'] = geminiKey.value.trim();
        }
        
        const groqKey = secrets.find((s: any) => isGroqKey(s.key));
        if (groqKey && groqKey.value) {
          headers['x-groq-key'] = groqKey.value.trim();
        }

        const openRouterKey = secrets.find((s: any) => isOpenRouterKey(s.key));
        if (openRouterKey && openRouterKey.value) {
          headers['x-openrouter-key'] = openRouterKey.value.trim();
        }
      }
    }
  } catch (e) {}
  return headers;
};

const repairTruncatedJSON = (str: string): string => {
  str = str.trim();
  if (!str.startsWith('{')) {
    const firstBrace = str.indexOf('{');
    if (firstBrace !== -1) {
      str = str.substring(firstBrace);
    } else {
      throw new Error("No open brace found to start JSON");
    }
  }

  let inString = false;
  let isEscaped = false;
  const stack: ('{' | '[')[] = [];
  let cleanStr = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isEscaped) {
      cleanStr += char;
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      cleanStr += char;
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      cleanStr += char;
      continue;
    }

    if (inString) {
      cleanStr += char;
      continue;
    }

    if (char === '{') {
      stack.push('{');
    } else if (char === '[') {
      stack.push('[');
    } else if (char === '}') {
      const last = stack.pop();
    } else if (char === ']') {
      const last = stack.pop();
    }
    cleanStr += char;
  }

  // Close unclosed string
  if (inString) {
    cleanStr += '"';
  }

  // Remove trailing comma if presents
  let polished = cleanStr.trim();
  if (polished.endsWith(',')) {
    polished = polished.substring(0, polished.length - 1);
  }

  // Close unclosed structural objects/arrays
  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') {
      polished += '}';
    } else if (last === '[') {
      polished += ']';
    }
  }

  return polished;
};

const extractPayloadRegexFallback = (text: string) => {
  const htmlRegex = /<!DOCTYPE html>[\s\S]*<\/html>/i;
  let htmlMatch = text.match(htmlRegex);
  
  if (!htmlMatch) {
    const htmlRegex2 = /<html[\s\S]*<\/html>/i;
    htmlMatch = text.match(htmlRegex2);
  }
  
  if (!htmlMatch) {
    const looseRegex = /(<!DOCTYPE html>|<html)[\s\S]*/i;
    htmlMatch = text.match(looseRegex);
  }
  
  const preview_code = htmlMatch ? htmlMatch[0] : "";
  
  let explanation = "Création de site haut de gamme avec COOK IA. Le code a été extrait avec succès de la réponse de l'IA.";
  const explanationRegex = /"explanation"\s*:\s*"([^"]+)"/;
  const explanationMatch = text.match(explanationRegex);
  if (explanationMatch && explanationMatch[1]) {
    explanation = explanationMatch[1];
  } else {
    const paragraphs = text.split('\n\n').filter(p => !p.includes('{') && !p.includes('}') && p.length > 50 && p.length < 500);
    if (paragraphs.length > 0) {
      explanation = paragraphs[0];
    }
  }

  return {
    explanation,
    preview_code,
    files: [
      {
        path: "index.html",
        content: preview_code
      }
    ]
  };
};

const cleanAndParseJSON = (text: string) => {
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  cleaned = cleaned.trim();
  
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  let target = cleaned;
  if (start !== -1 && end !== -1 && end > start) {
    target = cleaned.substring(start, end + 1);
  }
  
  try {
    return JSON.parse(target);
  } catch (error: any) {
    console.warn("Standard JSON parsing failed. Trying repair truncated JSON...", error.message);
    try {
      const repaired = repairTruncatedJSON(cleaned);
      return JSON.parse(repaired);
    } catch (repairError: any) {
      console.warn("JSON repair failed, falling back to regex extraction...", repairError.message);
      try {
        const fallback = extractPayloadRegexFallback(text);
        if (fallback.preview_code) {
          return fallback;
        }
      } catch (regexError: any) {
        console.error("Regex fallback extraction failed:", regexError.message);
      }
    }
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }
};

const isUserKeyOrQuotaError = (msg: string) => {
  const normalized = msg.toLowerCase();
  return (
    normalized.includes("key") ||
    normalized.includes("api_key") ||
    normalized.includes("apikey") ||
    normalized.includes("unauthorized") ||
    normalized.includes("forbidden") ||
    normalized.includes("quota") ||
    normalized.includes("billing") ||
    normalized.includes("limit") ||
    normalized.includes("invalid") ||
    normalized.includes("clã©") || // Handle encoding in error messages
    normalized.includes("clé")
  );
};

const callGeminiProxy = async (prompt: string, history: any[], systemInstruction?: string, model?: string, images?: any[], responseMimeType?: string): Promise<string> => {
  const currentModel = model || "gemini-3.5-flash";
  try {
    const response = await fetch("/api/ai/gemini", {
      method: "POST",
      headers: getCustomHeaders(),
      body: JSON.stringify({ prompt, history, systemInstruction, model: currentModel, images, responseMimeType })
    });

    if (!response.ok) {
      const err = await response.json();
      const errMsg = err.error || "Failed to call Gemini proxy";
      
      const isUnavailable = errMsg.toLowerCase().includes("demand") || 
                            errMsg.toLowerCase().includes("unavailable") || 
                            errMsg.toLowerCase().includes("503") ||
                            response.status === 503;
                            
      if (isUnavailable && currentModel === "gemini-3.5-flash") {
        console.warn("[Gemini Recovery] gemini-3.5-flash is experiencing high demand. Retrying with gemini-2.5-flash...");
        return await callGeminiProxy(prompt, history, systemInstruction, "gemini-2.5-flash", images, responseMimeType);
      }
      
      throw new Error(errMsg);
    }

    const result = await response.json();
    return result.text;
  } catch (error: any) {
    const errMsg = error.message || "";
    const isUnavailable = errMsg.toLowerCase().includes("demand") || 
                          errMsg.toLowerCase().includes("unavailable") || 
                          errMsg.toLowerCase().includes("503");
                          
    if (isUnavailable && currentModel === "gemini-3.5-flash") {
      console.warn("[Gemini Recovery] gemini-3.5-flash is experiencing high demand/network error. Retrying with gemini-2.5-flash...");
      return await callGeminiProxy(prompt, history, systemInstruction, "gemini-2.5-flash", images, responseMimeType);
    }
    throw error;
  }
};

const generateWithAIFallback = async (
  prompt: string,
  history: any[],
  images?: { mimeType: string, data: string }[],
  targetModel?: string
) => {
  console.debug("[Fallback] Gemini is unresponsive or alternate model selected. Switching to fallback...");

  const response = await fetch("/api/ai/fallback", {
    method: "POST",
    headers: getCustomHeaders(),
    body: JSON.stringify({
      prompt,
      history,
      images,
      targetModel
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errMsg = "";
    try {
      const err = JSON.parse(responseText);
      errMsg = err.error || err.message || JSON.stringify(err);
    } catch (e) {
      errMsg = responseText || response.statusText || `HTTP Status ${response.status}`;
    }
    throw new Error(`AI Fallback Error: ${errMsg}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("Failed to parse fallback response as JSON. Content:", responseText);
    throw new Error(`Invalid JSON response from fallback server: ${error.message}`);
  }
};

export const convertToReact = async (htmlCode: string, framework: 'react' | 'nextjs' | 'python' | 'javascript') => {
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

  const hasUserKey = !!getCustomHeaders()['x-gemini-key'];
  const isHealthy = shadowWatchdog.isHealthy();

  // Switch to fallback if primary is unhealthy AND user has no explicit API Key
  if (!isHealthy && !hasUserKey) {
    return await generateWithAIFallback(targetPrompt, []);
  }

  try {
    const text = await callGeminiProxy(targetPrompt, [], "You are a world-class full-stack developer.", undefined, undefined, "application/json");
    return cleanAndParseJSON(text);
  } catch (error: any) {
    if (isUserKeyOrQuotaError(error.message)) {
      throw error;
    }
    if (!hasUserKey) {
      shadowWatchdog.setUnhealthy();
    }
    console.debug("Error converting code, trying fallback:", error);
    return await generateWithAIFallback(targetPrompt, []);
  }
};

export const improveText = async (text: string, style: 'professional' | 'creative' | 'sales') => {
  try {
    const stylePrompts = {
      professional: "Rewrite this text to be professional, serious, and reassuring. Suitable for corporate or B2B contexts.",
      creative: "Rewrite this text to be creative, original, and dynamic. Suitable for startups or creative agencies.",
      sales: "Rewrite this text to be sales-oriented, persuasive, and focused on conversion. Use marketing psychological triggers."
    };

    const improvedText = await callGeminiProxy(
      `ORIGINAL TEXT: "${text}" STYLE REQUEST: ${stylePrompts[style]} Return ONLY the improved text string.`,
      [],
      "You are an expert copywriter."
    );
    return improvedText;
  } catch (error) {
    console.error("Error improving text:", error);
    throw error;
  }
};

export const updateSection = async (
  prompt: string,
  sectionHtml: string,
  fullCode: string,
  history: any[],
  model: string = "gemini-3.5-flash"
) => {
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

  const hasUserKey = !!getCustomHeaders()['x-gemini-key'];
  const isHealthy = shadowWatchdog.isHealthy();
  const isGemini = model.startsWith("gemini-") || model.startsWith("google/");

  if ((!isHealthy || !isGemini) && !hasUserKey) {
    return await generateWithAIFallback(userPrompt, history, undefined, model);
  }

  try {
    const text = await callGeminiProxy(userPrompt, history, systemInstruction, model, undefined, "application/json");
    return cleanAndParseJSON(text);
  } catch (error: any) {
    if (isUserKeyOrQuotaError(error.message)) {
      throw error;
    }
    if (!hasUserKey) {
      shadowWatchdog.setUnhealthy();
    }
    console.debug("Error updating section, trying fallback:", error);
    return await generateWithAIFallback(userPrompt, history);
  }
};

export const generateWebsite = async (
  prompt: string, 
  history: { role: "user" | "model", parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[],
  images?: { mimeType: string, data: string }[],
  videos?: { mimeType: string, data: string }[],
  model: string = "gemini-3.5-flash"
) => {
  const hasUserKey = !!getCustomHeaders()['x-gemini-key'];
  const isHealthy = shadowWatchdog.isHealthy();
  const isGemini = model.startsWith("gemini-") || model.startsWith("google/");

  // Silent Fallback Protocol: If primary is unhealthy OR custom model is not a gemini model, go straight to fallback
  if ((!isHealthy || !isGemini) && !hasUserKey) {
    console.log(`[Watchdog] Skipping Gemini. Reason: ${!isHealthy ? 'unhealthy' : 'custom model: ' + model}`);
    return await generateWithAIFallback(prompt, history, images, model);
  }

  try {
    // Log the coding session in the background (Watchdog) via proxy or direct fetch
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

    const text = await callGeminiProxy(prompt, history, systemInstruction, model, images, "application/json");
    return { ...cleanAndParseJSON(text), _provider: 'gemini' };
  } catch (error: any) {
    if (isUserKeyOrQuotaError(error.message)) {
      throw error;
    }
    if (!hasUserKey) {
      shadowWatchdog.setUnhealthy();
    }
    console.debug("Gemini failed, trying fallback chain:", error);
    return await generateWithAIFallback(prompt, history, images);
  }
};

export const generateTitle = async (prompt: string) => {
  try {
    const text = await callGeminiProxy(
      `Generate a very short, catchy title (max 4 words) for a website project based on this prompt: "${prompt}". Return only the title text.`,
      [],
      "You are a creative copywriter."
    );
    return text.trim() || "New Website";
  } catch (error) {
    console.debug("Gemini Title generation failed:", error);
    return "New Website";
  }
};
