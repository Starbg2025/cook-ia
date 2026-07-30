const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Fix announcement message
content = content.replace("Nouveau réseau de modèles IA 100% gratuits activé (Gemini, Groq, OpenRouter, Nvidia) !", "Nouveau réseau de modèles IA 100% gratuits activé (Gemini, Groq, OpenRouter) !");

// Fix the fallback cycle text
content = content.replace("Gemini Free ➔ Groq Free ➔ OpenRouter Free ➔ Nvidia NIM Free", "Gemini Free ➔ Groq Free ➔ OpenRouter Free");

// Remove the Nvidia model object
const nvidiaModelRegex = /,\s*\{\s*id:\s*'nvidia-llama-3\.3-70b'[\s\S]*?badge:\s*'100% Gratuit'\s*\}/;
content = content.replace(nvidiaModelRegex, "");

fs.writeFileSync('src/components/SettingsModal.tsx', content);
console.log("Fixed SettingsModal.tsx");
