import { shadowWatchdog } from "./multiAgentService";

const systemInstruction = `Tu es un générateur de sites web. Tu dois TOUJOURS inclure <script src="https://cdn.tailwindcss.com"></script> dans le <head> de chaque site généré. Renvoie un document HTML complet.

/* Designed by Studio Design Architect - Human Agency Mode Active */
PROTOCOL SYSTEM CONFIGURATION: STUDIO DESIGN LEAD ARCHITECT

ROLE
You are the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.

GROUND IT IN THE SUBJECT
If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. The subject's own world — its materials, instruments, artifacts, and vernacular — is where distinctive choices come from. Build with the brief's real content and subject matter throughout. Never use Lorem Ipsum or placeholder text.

DESIGN PRINCIPLES
- The hero is a thesis: open with the most characteristic thing in the subject's world, in whatever form makes sense for it — a headline, an image, an animation, a live demo, an interactive moment. A big number with a small label and a gradient accent is the template answer — only use it if it's truly the best option for this subject.
- Typography carries the personality of the page: pair a display face and a body face deliberately, not the same families you'd reach for on any other project. Set a clear type scale with intentional weights and spacing.
- Structure is information: numbering, eyebrows, and dividers should encode something true about the content, not decorate it. Numbered markers (01/02/03) are only appropriate if the content is genuinely a sequence.
- Use motion deliberately: think about where animation actually serves the subject. One orchestrated moment lands harder than scattered effects. Excessive animation is itself a tell that a design was AI-generated.
- Match complexity to the vision: maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail.

AVOID THESE AI-GENERATED DESIGN DEFAULTS (unless the brief explicitly asks for one)
1. A warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta/warm-clay accent (near #D97757)
2. A near-black background with a single bright acid-green or vermilion accent
3. A broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns

These are legitimate for some briefs, but they are defaults, not choices — they show up regardless of subject. If the brief leaves an axis (color, type, layout) free, don't spend that freedom on one of these defaults.

MANDATORY TWO-PASS PROCESS (before writing any code)
Pass 1 — Design plan (decide before writing a single line of code):
- Color: 4–6 named hex values, chosen for this specific subject
- Type: at least 2 typefaces (a characterful display face used with restraint, a complementary body face)
- Layout: one clear layout concept, described in one sentence, with an ASCII wireframe if useful
- Signature: the ONE unique element this page will be remembered by

Pass 2 — Self-critique before building:
Review the plan: would this be the generic default you'd produce for any similar brief? If any part reads that way, revise it before writing code. Only start coding once the plan is confirmed as genuinely specific to this subject — then follow it exactly, deriving every color and type decision from it.

RESTRAINT
Spend your boldness in one place — the signature element. Keep everything else quiet and disciplined; cut any decoration that doesn't serve the brief. Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, real working interactivity (no fake buttons, no generic toast-notification patches standing in for actual functionality).

WRITING
Write from the end user's side of the screen — name things by what people control and recognize, not by how the system is built. Use active voice: a button says exactly what happens when clicked ("Save changes," not "Submit"). Never use placeholder names like "John Doe" or generic testimonials — write realistic, specific copy tied to the actual subject.

TECHNICAL RULES & MULTI-FILE STRUCTURE
- All colors and fonts loaded via CSS/Google Fonts must actually be applied in the stylesheet — never leave an imported font unused while defaulting to a system font like Arial.
- Watch CSS selector specificity so classes don't cancel each other out (especially type-based selectors like .section vs. element-based selectors like .cta), particularly for spacing between sections.
- Every interactive element (buttons, links) must have real, working functionality tied to the actual page content — not a generic click-handler that just shows a toast or alert.
- MANDATORY OVERFLOW-X ZERO: Always set 'overflow-x: hidden' and 'max-width: 100vw' on 'html' and 'body' in styles.css.
- ABSOLUTE ZERO EMOJIS IN THE DESIGN: Strictly forbidden to use emojis in titles, badges, or cards. Use EXCLUSIVELY fine SVG vector icons or Lucide icons (\`lucide.createIcons()\`).
- MANDATORY 100% WORKING JS INTERACTIVE COMPONENTS: tab filters, interactive switches, modals, FAQ accordions, sliders/carousels.

Always generate a complete project consisting of 3 mandatory files:
- "index.html": Clean semantic HTML5 code, including <link rel="stylesheet" href="styles.css"> and <script src="script.js"></script>.
- "styles.css": Complete custom CSS style file with refined typography, delicate borders, and perfect mobile responsiveness.
- "script.js": Full working Vanilla JavaScript code handling mobile menu, tab filters, modal dialogs, form validation, FAQ accordion, and Lucide icon initialization (\`lucide.createIcons()\`).

Return the response EXCLUSIVELY in JSON format with three fields (do not include any other text outside the JSON):
1. 'explanation': A brief, professional description of the architectural and design choices made.
2. 'code': The complete index.html file content. DO NOT use markdown code blocks inside JSON fields.
3. 'files': An array of objects with 'path' (e.g., "index.html", "styles.css", "script.js") and 'content' (the clean unescaped file content).
`;

// Helper to decode escaped characters, markdown fences, and HTML entities
export const cleanAndUnescapeCode = (raw: string): string => {
  if (!raw || typeof raw !== 'string') return '';
  let code = raw.trim();

  // 1. Strip markdown code fences if wrapped
  if (code.startsWith('```')) {
    code = code.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  // 2. Unescape literal escaped quotes and backslashes unconditionally
  if (code.includes('\\"') || code.includes('\\n') || code.includes('\\t') || code.includes('\\\\')) {
    code = code
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
  }

  // 3. Decode HTML entities
  if (code.includes('&lt;') || code.includes('&gt;')) {
    code = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  return code.trim();
};

// Bundle multi-file project files into a single standalone HTML for iframe execution
export const bundleProjectFiles = (files: { path: string; content: string }[], mainCode?: string): string => {
  const cleanedFiles = (files || []).map(f => ({
    path: f.path,
    content: cleanAndUnescapeCode(f.content || '')
  }));

  const mainIndexFile = cleanedFiles.find(f => 
    f.path === 'index.html' || f.path === 'src/index.html' || f.path.endsWith('.html')
  );

  let html = mainIndexFile?.content || cleanAndUnescapeCode(mainCode || '');
  if (!html) {
    return `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;padding:2rem;"><h2>Aucun code HTML disponible</h2></body></html>`;
  }

  // Find CSS and JS files
  const cssFiles = cleanedFiles.filter(f => f.path.endsWith('.css'));
  const jsFiles = cleanedFiles.filter(f => f.path.endsWith('.js'));

  // Ensure head tag exists or add one
  if (!html.includes('<head>')) {
    if (html.includes('<html')) {
      html = html.replace(/<html[^>]*>/i, '$&\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>');
    } else {
      html = `<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body>\n${html}\n</body>\n</html>`;
    }
  }

  // Inject required CDNs into head if missing
  const cdnInjections = [];
  if (!html.includes('tailwindcss.com')) {
    cdnInjections.push('<script src="https://cdn.tailwindcss.com"></script>');
  }
  if (!html.includes('lucide') && !html.includes('unpkg.com/lucide')) {
    cdnInjections.push('<script src="https://unpkg.com/lucide@latest"></script>');
  }
  if (!html.includes('font-awesome') && !html.includes('fontawesome')) {
    cdnInjections.push('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">');
  }
  if (!html.includes('googleapis.com/css2')) {
    cdnInjections.push('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@500;700;800&display=swap">');
  }

  if (cdnInjections.length > 0) {
    html = html.replace('</head>', `${cdnInjections.join('\n')}\n</head>`);
  }

  // Inject mobile overflow & responsive typography guard CSS
  const mobileFixCss = `<style id="cook-ia-mobile-fix">
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    width: 100% !important;
    margin: 0;
    padding: 0;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  h1 {
    font-size: clamp(2rem, 7.5vw, 4.25rem) !important;
    line-height: 1.15 !important;
    overflow-wrap: break-word !important;
    word-break: break-word !important;
    hyphens: auto;
    max-width: 100% !important;
  }
  .hero, header, section, footer, main, container, .container {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
</style>`;

  if (!html.includes('id="cook-ia-mobile-fix"')) {
    html = html.replace('</head>', `${mobileFixCss}\n</head>`);
  }

  // Inline CSS files
  cssFiles.forEach(css => {
    const filename = css.path.split('/').pop() || css.path;
    const linkRegex = new RegExp(`<link[^>]*href=["'](?:\\./|/)?${filename.replace('.', '\\.')}["'][^>]*>`, 'gi');
    if (linkRegex.test(html)) {
      html = html.replace(linkRegex, `<style data-file="${css.path}">\n${css.content}\n</style>`);
    } else {
      html = html.replace('</head>', `<style data-file="${css.path}">\n${css.content}\n</style>\n</head>`);
    }
  });

  // Inline JS files
  jsFiles.forEach(js => {
    const filename = js.path.split('/').pop() || js.path;
    const scriptRegex = new RegExp(`<script[^>]*src=["'](?:\\./|/)?${filename.replace('.', '\\.')}["'][^>]*>\\s*<\\/script>`, 'gi');
    if (scriptRegex.test(html)) {
      html = html.replace(scriptRegex, `<script data-file="${js.path}">\n${js.content}\n</script>`);
    } else {
      if (html.includes('</body>')) {
        html = html.replace('</body>', `<script data-file="${js.path}">\n${js.content}\n</script>\n</body>`);
      } else {
        html = html + `\n<script data-file="${js.path}">\n${js.content}\n</script>`;
      }
    }
  });

  // Inject Lucide auto-initialization script to ensure all icons render
  const lucideInitScript = `
<script id="lucide-auto-init">
  (function() {
    function initIcons() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initIcons);
    } else {
      initIcons();
    }
    setTimeout(initIcons, 300);
    setTimeout(initIcons, 1000);
  })();
</script>
`;

  if (!html.includes('id="lucide-auto-init"')) {
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${lucideInitScript}\n</body>`);
    } else {
      html += lucideInitScript;
    }
  }

  if (!html.toLowerCase().startsWith('<!doctype')) {
    html = '<!DOCTYPE html>\n' + html;
  }

  return html;
};

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

export const normalizeResult = (res: any) => {
  if (!res || typeof res !== 'object') {
    return {
      explanation: "Code généré avec COOK IA",
      preview_code: "",
      code: "",
      files: []
    };
  }

  let rawCodeStr = res.preview_code || res.code || res.htmlCode || res.html || res.source || res.updated_section_html || "";
  let filesArr: { path: string; content: string }[] = Array.isArray(res.files) && res.files.length > 0 ? res.files : [];

  filesArr = filesArr.map((f: any) => ({
    path: f.path || 'index.html',
    content: cleanAndUnescapeCode(f.content || "")
  }));

  if (filesArr.length === 0 && rawCodeStr) {
    const cleanedCode = cleanAndUnescapeCode(rawCodeStr);
    filesArr = [
      { path: "index.html", content: cleanedCode },
      { path: "styles.css", content: "/* Styles personnalisés COOK IA */\n" },
      { path: "script.js", content: "// Script interactif COOK IA\n" }
    ];
  }

  const bundledHtml = bundleProjectFiles(filesArr, rawCodeStr);

  return {
    ...res,
    explanation: res.explanation || "Génération du site web par COOK IA.",
    preview_code: bundledHtml,
    code: bundledHtml,
    updated_section_html: res.updated_section_html || bundledHtml,
    files: filesArr
  };
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

  return normalizeResult({
    explanation,
    preview_code,
    files: [
      {
        path: "index.html",
        content: preview_code
      }
    ]
  });
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
    const parsed = JSON.parse(target);
    return normalizeResult(parsed);
  } catch (error: any) {
    console.log("Standard JSON parsing note:", error.message);
    try {
      const repaired = repairTruncatedJSON(cleaned);
      const parsed = JSON.parse(repaired);
      return normalizeResult(parsed);
    } catch (repairError: any) {
      console.log("JSON repair note:", repairError.message);
      try {
        const fallback = extractPayloadRegexFallback(text);
        if (fallback.preview_code) {
          return normalizeResult(fallback);
        }
      } catch (regexError: any) {
        console.log("Regex fallback note:", regexError.message);
      }
    }
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }
};

const isInvalidUserKeyError = (msg: string, hasUserKey: boolean) => {
  if (hasUserKey) {
    const normalized = msg.toLowerCase();
    if (normalized.includes("api_key_invalid") || normalized.includes("invalid api key")) {
      return true;
    }
  }
  return false;
};

const callGeminiProxy = async (prompt: string, history: any[], systemInstruction?: string, model?: string, images?: any[], responseMimeType?: string) => {
  const response = await fetch("/api/ai/gemini", {
    method: "POST",
    headers: getCustomHeaders(),
    body: JSON.stringify({ prompt, history, systemInstruction, model, images, responseMimeType })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to call Gemini proxy");
  }

  const result = await response.json();
  return result.text;
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
    const parsed = JSON.parse(responseText);
    return normalizeResult(parsed);
  } catch (error: any) {
    console.error("Failed to parse fallback response as JSON. Trying extractPayloadRegexFallback...", responseText.substring(0, 100));
    const fallback = extractPayloadRegexFallback(responseText);
    if (fallback && fallback.preview_code) {
      return normalizeResult(fallback);
    }
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
    if (isInvalidUserKeyError(error.message, hasUserKey)) {
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
  model: string = "gemini-2.5-flash"
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
    if (isInvalidUserKeyError(error.message, hasUserKey)) {
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
  model: string = "gemini-2.0-flash"
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
    if (isInvalidUserKeyError(error.message, hasUserKey)) {
      throw error;
    }
    if (!hasUserKey) {
      shadowWatchdog.setUnhealthy();
    }
    console.debug("Gemini failed, trying fallback chain:", error);
    return await generateWithAIFallback(prompt, history, images);
  }
};

export const answerQuestion = async (
  prompt: string,
  history: any[],
  model: string = "gemini-2.0-flash"
) => {
  const qaInstruction = "Tu es COOK IA, l'assistant senior web de classe mondiale créé par Benit Madimba. L'utilisateur te pose une question directe sur son projet, le code web ou le développement. Réponds-lui directement de manière claire, concise, structurée et bienveillante en français avec du formatage Markdown si utile. Ne génère AUCUN code HTML complet ou JSON de site web, réponds simplement sous forme de texte explicatif naturel.";
  
  const hasUserKey = !!getCustomHeaders()['x-gemini-key'];
  const isHealthy = shadowWatchdog.isHealthy();
  const isGemini = model.startsWith("gemini-") || model.startsWith("google/");

  if ((!isHealthy || !isGemini) && !hasUserKey) {
    try {
      const res = await generateWithAIFallback(prompt, history, undefined, model);
      return typeof res === 'string' ? res : (res.explanation || (res as any).text || JSON.stringify(res));
    } catch (e: any) {
      return "Je suis à votre disposition pour répondre à toutes vos questions sur votre projet web.";
    }
  }

  try {
    const text = await callGeminiProxy(prompt, history, qaInstruction, model);
    return text;
  } catch (error: any) {
    if (isInvalidUserKeyError(error.message, hasUserKey)) throw error;
    try {
      const res = await generateWithAIFallback(prompt, history, undefined, model);
      return typeof res === 'string' ? res : (res.explanation || (res as any).text || JSON.stringify(res));
    } catch (e) {
      return "Je suis à votre disposition pour répondre à toutes vos questions sur votre projet web.";
    }
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
