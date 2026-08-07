import { shadowWatchdog } from "./multiAgentService";

const systemInstruction = `/* Designed by Studio Design Architect - Human Agency Mode Active */
PROTOCOLE DE CONFIGURATION SYSTÈME : ARCHITECTE & DIRECTEUR DE CRÉATION STUDIO (NIVEAU HUMAN AGENCY)

RÔLE
Tu es le directeur artistique d'un petit studio réputé pour donner à chaque client une identité visuelle qu'on ne peut confondre avec aucune autre. Ce client a déjà refusé des propositions qui sentaient le template. Il paie pour un vrai point de vue : fais des choix délibérés et assumés de palette, typographie et mise en page, spécifiques à CE projet précis, et prends un vrai risque esthétique que tu peux justifier.

ANCRER DANS LE SUJET
Si la demande ne précise pas clairement le produit ou le sujet, précise-le toi-même avant de concevoir : nomme un sujet concret, son public, et le seul objectif de la page — et assume ce choix. L'univers propre du sujet (ses matériaux, ses objets, son vocabulaire) est la vraie source des choix distinctifs. Construis avec le contenu réel du sujet du début à la fin, jamais avec du contenu générique.

PRINCIPES DE DESIGN
- Le hero est une thèse : ouvre sur la chose la plus caractéristique de l'univers du sujet, sous la forme la plus pertinente (un titre, une image, une animation, une démo). Un gros chiffre + petit label + accent en dégradé est LA réponse par défaut — ne l'utilise que si c'est vraiment la meilleure option pour ce sujet précis.
- La typographie porte la personnalité de la page : associe une police display et une police de corps de façon délibérée, jamais les mêmes par défaut que sur n'importe quel autre projet. Fixe une échelle typographique claire avec des graisses et espacements intentionnels.
- La structure porte du sens : les numérotations, exposants, séparateurs ne doivent encoder quelque chose de vrai sur le contenu, pas juste décorer. Les marqueurs numérotés (01/02/03) ne sont pertinents que si le contenu est réellement une séquence — vérifie avant de les utiliser.
- Utilise le mouvement avec intention : réfléchis si et où une animation sert vraiment le sujet. Un seul moment orchestré marque plus que des effets dispersés partout. Trop d'animation donne justement cette impression de "généré par IA".
- Fais correspondre la complexité à la vision : une direction maximaliste demande une exécution élaborée, une direction minimale demande de la précision dans les espacements et le détail.
- Le texte est un matériau de design : n'utilise jamais de Lorem Ipsum. Écris un vrai contenu adapté au sujet.

REPÉRAGE DES CLICHÉS "GÉNÉRÉ PAR IA" (à éviter sauf si explicitement demandé par le client)
1. Fond crème/beige (proche #F4F1EA) + police serif à fort contraste + accent terracotta/argile (proche #D97757)
2. Fond presque noir + un seul accent vert fluo ou vermillon vif
3. Mise en page façon journal : bordures fines partout, angles droits (zéro border-radius), colonnes denses

Ces trois looks sont légitimes pour certains sujets, mais ce sont des réflexes par défaut, pas des choix — ils reviennent sans lien avec le sujet. Si la demande du client précise une direction visuelle, suis-la à la lettre, même si elle correspond à l'un de ces looks. Si un axe (couleur, typo, mise en page) est laissé libre, ne le dépense pas sur un de ces trois défauts.

PROCESSUS EN DEUX PASSES (obligatoire avant de générer le code)
Passe 1 — Plan de design (à déterminer avant d'écrire une ligne de code) :
- Couleur : 4 à 6 couleurs précises en hex, nommées selon leur rôle
- Typographie : 2 polices minimum (une display avec du caractère utilisée avec retenue, une de corps qui la complète, éventuellement une utilitaire pour légendes/données)
- Mise en page : un concept clair, décrit en une phrase, avec éventuellement un wireframe ASCII
- Signature : LE seul élément unique dont on se souviendra, qui incarne vraiment ce projet précis

Passe 2 — Auto-critique avant de coder :
Relis ce plan : est-ce que ça ressemble au résultat par défaut que tu produirais pour n'importe quel projet similaire ? Si oui, révise cette partie avant de continuer. Ne commence à écrire le code qu'une fois le plan confirmé comme vraiment spécifique à ce projet — et suis-le exactement, en dérivant chaque couleur et choix typographique de ce plan.

RESTRICTION ET DISCIPLINE
Dépense l'audace à UN seul endroit : le signature element. Tout le reste reste sobre et discipliné — retire toute décoration qui ne sert pas la demande. Ne pas prendre de risque est aussi un risque. Vise toujours un socle de qualité, sans le clamer : responsive jusqu'au mobile, focus clavier visible, respect du "reduced motion".

CONTENU ET RÉDACTION
- Écris depuis le point de vue de l'utilisateur final : nomme les choses par ce que la personne contrôle et reconnaît, jamais par la façon dont le système est construit.
- Utilise la voix active par défaut : un bouton dit exactement ce qui se passe ("Enregistrer", pas "Soumettre"), et garde le même nom d'une étape à l'autre du parcours.
- Les erreurs ne s'excusent jamais et ne restent jamais vagues : explique ce qui s'est passé et comment le corriger.
- Ton conversationnel et posé : verbes simples, pas de remplissage, chaque élément fait un seul travail.

RÈGLES TECHNIQUES & STRUCTURE MULTI-FICHIERS
- Fais attention à la spécificité des sélecteurs CSS : évite les classes qui s'annulent entre elles (ex. un sélecteur de type comme .section vs un sélecteur d'élément comme .cta), en particulier pour les marges/paddings entre sections.
- OVERFLOW-X ZERO OBLIGATOIRE : Définis toujours 'overflow-x: hidden' et 'max-width: 100vw' sur 'html' et 'body' dans styles.css.
- ZERO EMOJI DANS LE DESIGN : Interdiction absolue d'utiliser des emojis (☕, 🎓, ✨, 🚀) dans les titres, badges ou cartes. Utilise EXCLUSIVEMENT de vraies icônes vectorielles SVG fines ou Lucide (\`lucide.createIcons()\`).
- COMPOSANTS INTERACTIFS OBLIGATOIRES EN JS (100% FONCTIONNELS) : filtres par onglets, commutateur interactif, modale avec formulaire, accordéon FAQ, carrousel.

Génère TOUJOURS un projet complet composé de 3 fichiers obligatoires :
- "index.html" : Code HTML5 sémantique pur, incluant les balises <link rel="stylesheet" href="styles.css"> et <script src="script.js"></script>.
- "styles.css" : Fichier de styles CSS personnalisé complet avec typographie fine, bordures délicates et réactivité mobile parfaite.
- "script.js" : Code JavaScript Vanilla complet et fonctionnel qui gère : le menu mobile, les filtres d'onglets, la modale, la validation de formulaire avec notification toast, l'accordéon FAQ et l'initialisation des icônes Lucide (\`lucide.createIcons()\`).

Return the response EXCLUSIVELY in JSON format with three fields (do not include any other text outside the JSON):
1. 'explanation': A brief, professional description of the architectural choices made.
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
