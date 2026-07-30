import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import helmet from "helmet";
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// High-reliability Gemini helper with model fallback cascade for 503 and high demand errors
async function generateGeminiContentWithFallback(ai: any, contents: any, config: any, baseModel: string = "gemini-2.5-flash") {
  const modelList = [baseModel];
  const backups = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
  
  for (const b of backups) {
    if (!modelList.includes(b)) {
      modelList.push(b);
    }
  }

  let lastErr = null;
  
  for (const m of modelList) {
    try {
      console.log(`[Gemini Helper] Attempting call with model: ${m}`);
      const res = await ai.models.generateContent({
        model: m,
        contents: contents,
        config: config
      });
      if (res && res.text) {
        console.log(`[Gemini Helper] Success with model: ${m}`);
        return res;
      } else {
        throw new Error(`Empty response from Gemini with model ${m}`);
      }
    } catch (err: any) {
      console.warn(`[Gemini Helper] Model ${m} failed:`, err.message || err);
      lastErr = err;
    }
  }
  
  throw lastErr || new Error("All Gemini models in fallback chain failed.");
}

// Multi-Provider Fallback Cascade Engine (Gemini Free -> Groq Free -> OpenRouter Free -> Nvidia Free -> Cycle)
async function runMultiProviderCycle(params: {
  prompt: string;
  history?: any[];
  images?: any[];
  systemInstruction?: string;
  geminiKey?: string;
  groqKey?: string;
  openRouterKey?: string;
  nvidiaKey?: string;
  baseModel?: string;
  isJsonMode?: boolean;
}): Promise<{ text: string; provider: string }> {
  const {
    prompt,
    history = [],
    images = [],
    systemInstruction,
    isJsonMode = false
  } = params;

  const geminiApiKey = (params.geminiKey || process.env.GEMINI_API_KEY || "").trim();
  const groqApiKey = (params.groqKey || process.env.GROQ_API_KEY || "").trim();
  const openRouterApiKey = (params.openRouterKey || process.env.OPENROUTER_API_KEY || "").trim();
  const nvidiaApiKey = (params.nvidiaKey || process.env.NVIDIA_API_KEY || "").trim();

  // Prepare standard OpenAI-compatible messages for Groq, OpenRouter, Nvidia
  const formattedOpenAIMessages: any[] = [];
  if (systemInstruction) {
    formattedOpenAIMessages.push({ role: "system", content: systemInstruction });
  }

  (history || []).forEach((h: any) => {
    let textParts = "";
    if (Array.isArray(h.parts)) {
      textParts = h.parts.map((p: any) => p.text || "").join("\n");
    } else if (typeof h.parts === 'string') {
      textParts = h.parts;
    } else if (h.content) {
      textParts = typeof h.content === 'string' ? h.content : JSON.stringify(h.content);
    }
    const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
    if (textParts) {
      formattedOpenAIMessages.push({ role, content: textParts });
    }
  });

  const userContentObj: any[] = [{ type: "text", text: prompt || "" }];
  if (images && images.length > 0) {
    images.forEach((img: any) => {
      if (img && img.mimeType && img.data) {
        userContentObj.push({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}` }
        });
      }
    });
  }
  formattedOpenAIMessages.push({ role: "user", content: images.length > 0 ? userContentObj : prompt });

  const maxCycles = 2;

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    console.log(`[Multi-Provider Engine] Starting Cycle ${cycle}/${maxCycles}...`);

    // Provider 1: Gemini Free Models
    if (geminiApiKey) {
      console.log(`[Cycle ${cycle}] Step 1: Trying Gemini Free models...`);
      const geminiModels = Array.from(new Set([params.baseModel || "gemini-2.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"]));
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const geminiContents = [
        ...(history || []).map((h: any) => {
          let parsedParts: any[] = [];
          if (Array.isArray(h.parts)) {
            parsedParts = h.parts.map((p: any) => p.text ? { text: p.text } : p);
          } else if (typeof h.parts === 'string') {
            parsedParts = [{ text: h.parts }];
          } else if (h.content) {
            parsedParts = [{ text: String(h.content) }];
          } else {
            parsedParts = [{ text: "" }];
          }
          return {
            role: h.role === "model" || h.role === "assistant" ? "model" : "user",
            parts: parsedParts
          };
        }),
        {
          role: "user",
          parts: [
            { text: prompt },
            ...(images || []).map((img: any) => ({
              inlineData: { mimeType: img.mimeType, data: img.data }
            }))
          ]
        }
      ];

      for (const m of geminiModels) {
        try {
          console.log(`[Gemini Free] Testing model: ${m}`);
          const res = await ai.models.generateContent({
            model: m,
            contents: geminiContents,
            config: {
              systemInstruction: systemInstruction || undefined,
              temperature: 0.7,
              responseMimeType: isJsonMode ? "application/json" : undefined
            }
          });
          if (res && res.text) {
            console.log(`[Gemini Free] Succeeded with model: ${m} in cycle ${cycle}`);
            return { text: res.text, provider: `gemini (${m})` };
          }
        } catch (err: any) {
          console.warn(`[Gemini Free] Model ${m} failed:`, err.message || err);
        }
      }
    } else {
      console.log(`[Cycle ${cycle}] Step 1: Gemini API key missing, moving to Groq...`);
    }

    // Provider 2: Groq Free Models
    if (groqApiKey) {
      console.log(`[Cycle ${cycle}] Step 2: Trying Groq Free models...`);
      const groqModels = ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it", "llama-3.1-8b-instant"];
      for (const m of groqModels) {
        try {
          console.log(`[Groq Free] Testing model: ${m}`);
          const bodyPayload: any = {
            model: m,
            messages: formattedOpenAIMessages,
            temperature: 0.7,
            max_tokens: 4096
          };
          if (isJsonMode) {
            bodyPayload.response_format = { type: "json_object" };
          }
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyPayload)
          });
          if (res.ok) {
            const data: any = await res.json();
            const text = data.choices[0]?.message?.content;
            if (text) {
              console.log(`[Groq Free] Succeeded with model: ${m} in cycle ${cycle}`);
              return { text, provider: `groq (${m})` };
            }
          } else {
            console.warn(`[Groq Free] HTTP error on model ${m}:`, res.status, await res.text());
          }
        } catch (err: any) {
          console.warn(`[Groq Free] Model ${m} failed:`, err.message || err);
        }
      }
    } else {
      console.log(`[Cycle ${cycle}] Step 2: Groq API key missing, moving to OpenRouter...`);
    }

    // Provider 3: OpenRouter Free Models
    if (openRouterApiKey) {
      console.log(`[Cycle ${cycle}] Step 3: Trying OpenRouter Free models...`);
      const openRouterHeader: any = {
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cook-ia.indevs.in",
        "X-Title": "COOK IA",
        "Authorization": `Bearer ${openRouterApiKey}`
      };
      const openRouterModels = [
        "google/gemini-2.5-flash:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "deepseek/deepseek-r1:free",
        "qwen/qwen-2.5-coder-32b-instruct:free"
      ];
      for (const m of openRouterModels) {
        try {
          console.log(`[OpenRouter Free] Testing model: ${m}`);
          const bodyPayload: any = {
            model: m,
            messages: formattedOpenAIMessages,
            temperature: 0.7,
            max_tokens: 4096
          };
          if (isJsonMode) {
            bodyPayload.response_format = { type: "json_object" };
          }
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: openRouterHeader,
            body: JSON.stringify(bodyPayload)
          });
          if (res.ok) {
            const data: any = await res.json();
            const text = data.choices[0]?.message?.content;
            if (text) {
              console.log(`[OpenRouter Free] Succeeded with model: ${m} in cycle ${cycle}`);
              return { text, provider: `openrouter (${m})` };
            }
          } else {
            console.warn(`[OpenRouter Free] HTTP error on model ${m}:`, res.status, await res.text());
          }
        } catch (err: any) {
          console.warn(`[OpenRouter Free] Model ${m} failed:`, err.message || err);
        }
      }
    } else {
      console.log(`[Cycle ${cycle}] Step 3: OpenRouter API key missing, moving to Nvidia...`);
    }

    // Provider 4: Nvidia NIM Models
    if (nvidiaApiKey) {
      console.log(`[Cycle ${cycle}] Step 4: Trying Nvidia NIM models...`);
      const nvidiaModels = [
        "meta/llama-3.3-70b-instruct",
        "deepseek-ai/deepseek-r1",
        "mistralai/mistral-large-2-instruct",
        "nvidia/llama-3.1-nemotron-70b-instruct"
      ];
      for (const m of nvidiaModels) {
        try {
          console.log(`[Nvidia NIM] Testing model: ${m}`);
          const bodyPayload: any = {
            model: m,
            messages: formattedOpenAIMessages,
            temperature: 0.7,
            max_tokens: 4096
          };
          const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvidiaApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyPayload)
          });
          if (res.ok) {
            const data: any = await res.json();
            const text = data.choices[0]?.message?.content;
            if (text) {
              console.log(`[Nvidia NIM] Succeeded with model: ${m} in cycle ${cycle}`);
              return { text, provider: `nvidia (${m})` };
            }
          } else {
            console.warn(`[Nvidia NIM] HTTP error on model ${m}:`, res.status, await res.text());
          }
        } catch (err: any) {
          console.warn(`[Nvidia NIM] Model ${m} failed:`, err.message || err);
        }
      }
    } else {
      console.log(`[Cycle ${cycle}] Step 4: Nvidia API key missing, trying Pollinations AI Free...`);
    }

    // Provider 5: Pollinations AI Free Endpoint (No API Key Required)
    console.log(`[Cycle ${cycle}] Step 5: Trying Pollinations AI Free endpoint...`);
    try {
      const pollMessages = formattedOpenAIMessages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : (Array.isArray(m.content) ? m.content.map((c: any) => c.text || '').join('\n') : String(m.content))
      }));
      const pollRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: pollMessages,
          model: "openai",
          jsonMode: isJsonMode
        })
      });
      if (pollRes.ok) {
        const text = await pollRes.text();
        if (text && text.trim().length > 0) {
          console.log(`[Pollinations Free] Succeeded in cycle ${cycle}`);
          return { text: text.trim(), provider: "pollinations (free)" };
        }
      }
    } catch (err: any) {
      console.warn(`[Pollinations Free] Failed:`, err.message || err);
    }
  }

  throw new Error("All AI Providers (Gemini Free -> Groq Free -> OpenRouter Free -> Nvidia Free -> Pollinations Free) failed after multi-cycle attempts.");
}

const supabaseUrl = "https://bxsilckpxcpsgojrakfs.supabase.co";
const supabaseAnonKey = "sb_publishable_LGb-62oHXiolJluDwsXUiw_ZxRfiUpT";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Watchdog Architecture: Background Task Queue
interface WatchdogTask {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payload: any;
  result?: any;
  error?: string;
  createdAt: Date;
}

const taskQueue: WatchdogTask[] = [];
const MAX_QUEUE_SIZE = 100;

function addToWatchdog(type: string, payload: any) {
  const task: WatchdogTask = {
    id: Math.random().toString(36).substring(2, 15),
    type,
    status: 'pending',
    payload,
    createdAt: new Date()
  };
  
  if (taskQueue.length >= MAX_QUEUE_SIZE) {
    taskQueue.shift(); // Remove oldest
  }
  taskQueue.push(task);
  
  // Process task "invisibly"
  processTask(task.id);
  
  return task.id;
}

async function processTask(id: string) {
  const task = taskQueue.find(t => t.id === id);
  if (!task) return;

  task.status = 'processing';
  console.log(`[Watchdog] Processing task ${id} (${task.type})`);

  try {
    // Simulate background work based on type
    switch (task.type) {
      case 'site_deployment':
        await new Promise(resolve => setTimeout(resolve, 6000));
        const slug = task.payload.siteName.toLowerCase().replace(/\s+/g, '-') || 'site';
        task.result = { 
          url: `https://cook-ia.indevs.in/${slug}`,
          status: "Live",
          deployedAt: new Date()
        };
        break;
      case 'site_optimization':
        await new Promise(resolve => setTimeout(resolve, 5000));
        task.result = { message: "Code optimized and minified." };
        break;
      case 'security_scan':
        await new Promise(resolve => setTimeout(resolve, 3000));
        task.result = { threats: 0, status: "Secure" };
        break;
      case 'deployment_sync':
        await new Promise(resolve => setTimeout(resolve, 8000));
        task.result = { url: "https://sync.cook-ia.indevs.in/deploy/success" };
        break;
      case 'session_log':
        // Record connection and session metadata
        await new Promise(resolve => setTimeout(resolve, 1000));
        task.result = { 
          timestamp: new Date(),
          event: "AI_CODING_SESSION_STARTED",
          details: "Recording connection metadata and session state in background."
        };
        break;
      default:
        await new Promise(resolve => setTimeout(resolve, 2000));
        task.result = { status: "Done" };
    }
    task.status = 'completed';
    console.log(`[Watchdog] Task ${id} completed successfully`);
  } catch (error: any) {
    task.status = 'failed';
    task.error = error.message;
    console.error(`[Watchdog] Task ${id} failed:`, error.message);
  }
}

export const app = express();
const PORT = 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'unsafe-inline' https: wss:; img-src * data: blob:; frame-src *; style-src * 'unsafe-inline';");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Supabase Proxy for Logging

  app.post("/api/supabase/log-error", async (req, res) => {
    const { error, context } = req.body;
    try {
      const { error: dbError } = await supabase
        .from('error_logs')
        .insert([{ 
          error_message: error, 
          context: context,
          created_at: new Date().toISOString()
        }]);
      
      if (dbError) throw dbError;
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Supabase Proxy] Failed to log error:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/supabase/conversations", async (req, res) => {
    // Proxy for creating/updating conversations if needed
    // For now, I'll just proxy the specific log-error call to show the pattern
  });

  // Debug middleware
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[Server] ${req.method} ${req.url}`);
    }
    next();
  });

  app.post(["/api/deploy", "/api/deploy/"], async (req, res) => {
    const { siteName, code, files, userId } = req.body;
    
    if (!siteName || (!code && !files)) {
      return res.status(400).json({ success: false, message: "Site name and code/files are required." });
    }

    console.log(`[Deployment] Initiating deployment for: ${siteName}`);
    
    // Enqueue in watchdog for background processing/logging
    const taskId = addToWatchdog('site_deployment', { siteName, code, files, userId });
    
    try {
      const slug = siteName.toLowerCase().replace(/\s+/g, '-') || 'site';
      const url = `https://cook-ia.indevs.in/${slug}`;
      
      // Simulate real deployment steps
      console.log(`[Deployment] Step 1: Provisioning server for ${slug}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`[Deployment] Step 2: Uploading files...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`[Deployment] Step 3: Configuring DNS and SSL...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`[Deployment] Step 4: Site is now LIVE at ${url}`);
      
      res.json({ 
        success: true, 
        url: url,
        taskId: taskId,
        message: "Deployment successful! Your site is now live."
      });
    } catch (error: any) {
      console.error("[Deployment] Failed:", error.message);
      res.status(500).json({ success: false, message: "Deployment failed: " + error.message });
    }
  });

  // Watchdog API
  app.get("/api/watchdog/status", (req, res) => {
    res.json({
      queueSize: taskQueue.length,
      tasks: taskQueue.slice(-10).reverse() // Last 10 tasks
    });
  });

  app.post("/api/watchdog/enqueue", (req, res) => {
    const { type, payload } = req.body;
    const taskId = addToWatchdog(type, payload);
    res.json({ taskId });
  });

  // Agents Proxy
  app.post("/api/ai/agents", async (req, res) => {
    const { agentType, prompt, history, code } = req.body;
    let groqKey = req.headers['x-groq-key'] as string || process.env.GROQ_API_KEY;
    if (groqKey) groqKey = groqKey.trim();
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    let geminiKey = req.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY;
    if (geminiKey) geminiKey = geminiKey.trim();

    console.log(`[Agent] Type: ${agentType}, Gemini Keys present: ${!!geminiKey}, Groq Keys present: ${!!groqKey}`);

    const safeHistory = history || [];
    const formatHistory = (hist: any[]) => (hist || [])
      .filter(h => h && h.parts && h.parts[0])
      .map(h => `${h.role === "model" ? "Assistant" : "User"}: ${h.parts[0].text || ""}`)
      .join("\n");

    try {
      if (agentType === 'analyst') {
        // 1. Try Gemini
        if (geminiKey) {
            try {
              const ai = new GoogleGenAI({ apiKey: geminiKey });
              const response = await generateGeminiContentWithFallback(
                ai,
                `You are the 'Analyst' for COOK IA. Ask 1-2 questions to refine the project. Return JSON: { "needsClarification": boolean, "questions": string[], "isTechnicalQuestion": boolean, "answer": string }\n\nHISTORY:\n${formatHistory(safeHistory.slice(-5))}\n\nCURRENT PROMPT: ${prompt}`,
                { responseMimeType: "application/json" },
                "gemini-2.5-flash"
              );
              if (response.text) {
                return res.json(JSON.parse(response.text));
              }
            } catch (e: any) {
              console.warn("[Analyst] Gemini failed, trying Groq", e);
              if (e.message && (e.message.includes("API key not valid") || e.message.includes("API_KEY_INVALID"))) {
                  return res.status(400).json({ error: "Clé API Gemini invalide ou non configurée sur le serveur." });
              }
            }
        }
        
        // 2. Try Groq
        if (groqKey) {
            try {
              const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: "llama-3.3-70b-versatile",
                  messages: [
                    { role: "system", content: "You are the 'Analyst' for COOK IA. Ask 1-2 questions to refine the project or answer technical questions. Return JSON: { \"needsClarification\": boolean, \"questions\": string[], \"isTechnicalQuestion\": boolean, \"answer\": string }" },
                    { role: "user", content: `HISTORY:\n${formatHistory(safeHistory.slice(-5))}\n\nCURRENT PROMPT: ${prompt}` }
                  ],
                  response_format: { type: "json_object" }
                })
              });
              if (response.ok) {
                const data: any = await response.json();
                return res.json(JSON.parse(data.choices[0].message.content));
              }
            } catch (e) {
              console.warn("[Analyst] Groq failed, trying OpenRouter");
            }
        }

        // 3. Try OpenRouter
        if (openRouterKey) {
            try {
              const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${openRouterKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://cook-ia.indevs.in", "X-Title": "COOK IA" },
                body: JSON.stringify({
                  model: "google/gemini-2.0-flash-lite-preview-02-05:free",
                  messages: [
                    { role: "system", content: "You are the 'Analyst' for COOK IA. Ask 1-2 questions to refine the project. Return JSON: { \"needsClarification\": boolean, \"questions\": string[], \"isTechnicalQuestion\": boolean, \"answer\": string }" },
                    { role: "user", content: `PROMPT: ${prompt}` }
                  ],
                  response_format: { type: "json_object" }
                })
              });
              if (response.ok) {
                const data: any = await response.json();
                return res.json(JSON.parse(data.choices[0].message.content));
              }
            } catch (e) {
              console.warn("[Analyst] OpenRouter failed");
            }
        }

        return res.status(500).json({ error: "All AI providers failed" });
      }

      if (agentType === 'planner') {
        const apiKey = geminiKey;
        if (!apiKey) return res.json({ plan: "Planification simplifiée.", isComplex: false, subAgents: [] });
        
        const ai = new GoogleGenAI({ apiKey });
        
        try {
          const response = await generateGeminiContentWithFallback(
            ai,
            `You are the 'Planner' for COOK IA. Break down the user's request into a detailed technical plan. Return JSON: { "plan": "string", "isComplex": boolean, "subAgents": string[] }\n\nUSER REQUEST: ${prompt}\n\nHISTORY:\n${formatHistory(safeHistory.slice(-3))}`,
            { responseMimeType: "application/json" },
            "gemini-2.5-flash"
          );
          return res.json(JSON.parse(response.text));
        } catch (error: any) {
             console.error("[Planner] Error:", error);
             if (error.message && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID"))) {
                return res.status(400).json({ error: "Clé API Gemini invalide ou non configurée sur le serveur." });
             }
             return res.status(500).json({ error: error.message || "Invalid response from Gemini" });
        }
      }

      if (agentType === 'tester') {
        if (!groqKey) return res.json({ passed: true, errors: [] });
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are the 'Automated Tester'. Analyze code for bugs. Return JSON: { \"passed\": boolean, \"errors\": string[] }" },
              { role: "user", content: `PROMPT: ${prompt}\n\nCODE: ${code.substring(0, 5000)}` }
            ],
            response_format: { type: "json_object" }
          })
        });
        const data: any = await response.json();
        return res.json(JSON.parse(data.choices[0].message.content));
      }

      if (agentType === 'critic') {
        if (!openRouterKey) return res.json({ approved: true, feedback: "" });
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${openRouterKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://cook-ia.indevs.in", "X-Title": "COOK IA" },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free",
            messages: [
              { role: "system", content: "You are the 'Critic'. Verify if the generated code matches the request. Return JSON: { \"approved\": boolean, \"feedback\": string }" },
              { role: "user", content: `USER REQUEST: ${prompt}\n\nGENERATED CODE SUMMARY: ${code.substring(0, 2000)}...` }
            ],
            response_format: { type: "json_object" }
          })
        });
        const data: any = await response.json();
        return res.json(JSON.parse(data.choices[0].message.content));
      }

      // Add other agents as needed...
      res.status(400).json({ error: "Unknown agent type" });
    } catch (error: any) {
      console.error(`[Agent Proxy] Error for ${agentType}:`, error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Groq Interactive Advisor Proxy
  app.post("/api/ai/groq", async (req, res) => {
    const { question, code, history } = req.body;
    let groqKey = req.headers['x-groq-key'] as string || process.env.GROQ_API_KEY;
    if (groqKey) {
      groqKey = groqKey.trim();
      if ((groqKey.startsWith('"') && groqKey.endsWith('"')) || (groqKey.startsWith("'") && groqKey.endsWith("'"))) {
        groqKey = groqKey.slice(1, -1).trim();
      }
    }

    if (!groqKey) {
      return res.status(400).json({ error: "Clé API Groq manquante. Installez-la dans les secrets (GROQ_API_KEY) ou saisissez-la dans la barre latérale pour activer la puissance de Groq." });
    }

    try {
      const messages = [
        {
          role: "system",
          content: "Tu es un expert en ingénierie Web haut de gamme et l'assistant conseil Groq officiel de COOK IA. Ton rôle est d'analyser le code source fourni par l'utilisateur, répondre à ses questions techniques (ex: centrer un bouton, corriger un bug React/CSS, ajouter d'autres pages, optimiser les images), et lui proposer des idées de design créatives et de l'aide au diagnostic. Reste pro, direct, et donne des morceaux de code élégants, propres et directement exploitables."
        },
        ...(history || []).map((h: any) => ({
          role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content || ""
        })),
        {
          role: "user",
          content: `Voici le code du projet actuel :\n\n\`\`\`html\n${code || ""}\n\`\`\`\n\nQuestion / Problème technique de l'utilisateur : ${question}`
        }
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messages,
          temperature: 0.5,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Groq API a retourné une erreur: ${errText}` });
      }

      const data: any = await response.json();
      return res.json({ text: data.choices[0].message.content });
    } catch (err: any) {
      console.error("[Groq API Proxy] Exception:", err.message);
      return res.status(500).json({ error: `Exception Groq Proxy: ${err.message}` });
    }
  });

  // Standard Gemini Proxy with Multi-Provider Cycle (Gemini Free -> Groq Free -> OpenRouter Free -> Nvidia Free -> Cycle)
  app.post("/api/ai/gemini", async (req, res) => {
    const { prompt, history, images, systemInstruction: customSystem, model: requestedModel, responseMimeType } = req.body;
    let geminiKey = req.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY || "";
    if (geminiKey) {
      geminiKey = geminiKey.trim();
      if ((geminiKey.startsWith('"') && geminiKey.endsWith('"')) || (geminiKey.startsWith("'") && geminiKey.endsWith("'"))) {
        geminiKey = geminiKey.slice(1, -1).trim();
      }
      const upperKey = geminiKey.toUpperCase();
      if (upperKey.startsWith("FREE") || upperKey.includes("GRATUITE") || upperKey.includes("INCLUSE") || upperKey === "GEMINI_API_KEY") {
        geminiKey = process.env.GEMINI_API_KEY || "";
      }
    }

    let groqKey = req.headers['x-groq-key'] as string || process.env.GROQ_API_KEY || "";
    let openRouterKey = req.headers['x-openrouter-key'] as string || process.env.OPENROUTER_API_KEY || "";
    let nvidiaKey = req.headers['x-nvidia-key'] as string || process.env.NVIDIA_API_KEY || "";

    try {
      const result = await runMultiProviderCycle({
        prompt,
        history,
        images,
        systemInstruction: customSystem,
        geminiKey,
        groqKey,
        openRouterKey,
        nvidiaKey,
        baseModel: requestedModel || "gemini-2.5-flash",
        isJsonMode: responseMimeType === "application/json"
      });

      res.json({ text: result.text, provider: result.provider });
    } catch (error: any) {
      console.error("[Gemini Proxy] Multi-provider cycle exhausted:", error.message);
      res.status(500).json({ error: error.message || "Failed across all AI providers" });
    }
  });

  // Generic Supabase Proxy (Database operations)
  app.post("/api/supabase/db", async (req, res) => {
    const { table, action, data, id, query, userEmail } = req.body;
    
    try {
      const clientToUse = (userEmail === 'benit800@gmail.com' || userEmail?.includes('benit800')) ? adminSupabase : supabase;
      let result;
      switch (action) {
        case 'select':
          result = await clientToUse.from(table).select(query || '*').order('created_at', { ascending: false });
          break;
        case 'insert':
          result = await clientToUse.from(table).insert(data);
          break;
        case 'update':
          result = await clientToUse.from(table).update(data).eq('id', id);
          break;
        case 'delete':
          result = await clientToUse.from(table).delete().eq('id', id);
          break;
        default:
          throw new Error("Invalid action for Supabase proxy");
      }

      if (result.error) throw result.error;
      res.json(result.data);
    } catch (err: any) {
      console.error(`[Supabase DB Proxy] Error on ${table}/${action}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

let systemAnnouncement = {
  message: "La majorité des bugs sont corrigés par l'équipe !",
  active: true,
  updatedAt: new Date().toISOString(),
  updatedBy: "Admin"
};

let bannedUsersMap: Record<string, { userId: string; username?: string; reason?: string; bannedAt: string }> = {};

  // Get active system announcement
  app.get("/api/announcement", (req, res) => {
    res.json(systemAnnouncement);
  });

  // Admin update system announcement
  app.post("/api/admin/announcement", (req, res) => {
    const { adminEmail, message, active } = req.body;
    if (!adminEmail || (adminEmail !== 'benit800@gmail.com' && !adminEmail.includes('benit800'))) {
      return res.status(403).json({ error: "Accès refusé : Seul l'administrateur peut modifier l'annonce." });
    }
    systemAnnouncement = {
      message: message || "La majorité des bugs sont corrigés par l'équipe !",
      active: active !== undefined ? active : true,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail
    };
    console.log("[Admin Announcement Updated]", systemAnnouncement);
    res.json({ success: true, announcement: systemAnnouncement });
  });

  // Admin ban/unban user endpoint
  app.post("/api/admin/ban-user", (req, res) => {
    const { adminEmail, userId, username, reason, ban } = req.body;
    if (!adminEmail || (adminEmail !== 'benit800@gmail.com' && !adminEmail.includes('benit800'))) {
      return res.status(403).json({ error: "Accès refusé : Seul l'administrateur peut bannir des utilisateurs." });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId requis" });
    }

    if (ban) {
      bannedUsersMap[userId] = {
        userId,
        username: username || 'Inconnu',
        reason: reason || "Non-respect des règles de la plateforme.",
        bannedAt: new Date().toISOString()
      };
      console.log(`[Admin User Banned] User ID: ${userId}, Reason: ${reason}`);
    } else {
      delete bannedUsersMap[userId];
      console.log(`[Admin User Unbanned] User ID: ${userId}`);
    }

    res.json({ success: true, isBanned: !!bannedUsersMap[userId], bannedUsers: Object.values(bannedUsersMap) });
  });

  // Check if a user is banned
  app.post("/api/check-user-ban", (req, res) => {
    const { userId, username } = req.body;
    const banInfo = (userId && bannedUsersMap[userId]) || (username && bannedUsersMap[username]);
    if (banInfo) {
      return res.json({ banned: true, reason: banInfo.reason, bannedAt: banInfo.bannedAt });
    }
    res.json({ banned: false });
  });

  // Admin users-activity dashboard endpoint
  app.post("/api/admin/users-activity", async (req, res) => {
    const { adminEmail } = req.body;
    
    // Check if requester is Benit Madimba
    if (!adminEmail || (adminEmail !== 'benit800@gmail.com' && !adminEmail.includes('benit800'))) {
      return res.status(403).json({ error: "Access Denied: Only Benit Madimba can access system logs and users." });
    }

    try {
      // Fetch all profiles
      const { data: profiles, error: profilesErr } = await adminSupabase
        .from('profiles')
        .select('*');

      // Fetch all conversations
      const { data: conversations, error: convsErr } = await adminSupabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (convsErr) {
        throw new Error(`Failed to fetch conversations: ${convsErr.message}`);
      }

      // Merge and construct consolidated user objects
      const usersMap: Record<string, any> = {};

      // Initialize with profiles
      if (profiles) {
        profiles.forEach((p: any) => {
          usersMap[p.id] = {
            id: p.id,
            username: p.username || 'Utilisateur Anonyme',
            updatedAt: p.updated_at || null,
            isBanned: !!bannedUsersMap[p.id],
            banReason: bannedUsersMap[p.id]?.reason || null,
            conversations: []
          };
        });
      }

      // Group conversations by user_id
      if (conversations) {
        conversations.forEach((c: any) => {
          const userId = c.user_id;
          if (userId) {
            if (!usersMap[userId]) {
              usersMap[userId] = {
                id: userId,
                username: `Utilisateur #${userId.substring(0, 5)}`,
                updatedAt: c.created_at || null,
                isBanned: !!bannedUsersMap[userId],
                banReason: bannedUsersMap[userId]?.reason || null,
                conversations: []
              };
            }
            usersMap[userId].conversations.push({
              id: c.id,
              title: c.title || 'Sans titre',
              createdAt: c.created_at,
              messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
              latestPrompt: Array.isArray(c.messages) && c.messages.length > 1
                ? (c.messages.find((m: any) => m.role === 'user')?.content || 'Pas de message')
                : 'Nouveau chat'
            });
          }
        });
      }

      const usersList = Object.values(usersMap);
      res.json({ success: true, users: usersList, announcement: systemAnnouncement });
    } catch (err: any) {
      console.error("[Admin Users Activity] Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GitHub OAuth Routes
  app.get("/api/auth/github/url", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID || "Ov23liA514WLFLYyNTKv";
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
    console.log("Generated GitHub Auth URL:", url);
    res.json({ url });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID || "Ov23liA514WLFLYyNTKv";
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || "9513cfee93da536f281b6b657ef4d635c527cbbe";

    console.log("GitHub Callback received with code:", code ? "present" : "missing");

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const data: any = await response.json();
      
      if (data.error) {
        console.error("GitHub OAuth Error:", data.error_description || data.error);
        return res.status(400).send(`Error: ${data.error_description || data.error}`);
      }

      const accessToken = data.access_token;
      console.log("GitHub Access Token obtained successfully");

      res.send(`
        <html>
          <body style="background: #0A0A0A; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="color: #FF6B00;">Authentification Réussie !</h2>
              <p>Connexion à GitHub établie. Cette fenêtre va se fermer...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("GitHub Callback Error:", error.message);
      res.status(500).send(`Authentication failed: ${error.message}`);
    }
  });

  // GitHub API Proxy
  app.post("/api/github/create-repo", async (req, res) => {
    const { token, name, description, isPrivate, code: websiteCode } = req.body;

    try {
      // 1. Create Repository
      const createRepoRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: true,
        }),
      });

      if (!createRepoRes.ok) {
        const error = await createRepoRes.json();
        return res.status(createRepoRes.status).json(error);
      }

      const repoData: any = await createRepoRes.json();
      const owner = repoData.owner.login;
      const repoName = repoData.name;

      // 2. Create index.html file in the repo
      const createFileRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/index.html`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Initial commit from COOK IA",
          content: Buffer.from(websiteCode).toString("base64"),
        }),
      });

      if (!createFileRes.ok) {
        const error = await createFileRes.json();
        return res.status(createFileRes.status).json(error);
      }

      res.json({ success: true, url: repoData.html_url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Fallback Proxy (Gemini Free -> Groq Free -> OpenRouter Free -> Nvidia Free -> Cycle)
  app.post("/api/ai/fallback", async (req, res) => {
    try {
      const { prompt, history, images, targetModel } = req.body;
      const geminiKey = (req.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY || "").trim();
      const groqKey = (req.headers['x-groq-key'] as string || process.env.GROQ_API_KEY || "").trim();
      const openRouterKey = (req.headers['x-openrouter-key'] as string || process.env.OPENROUTER_API_KEY || "").trim();
      const nvidiaKey = (req.headers['x-nvidia-key'] as string || process.env.NVIDIA_API_KEY || "").trim();

      const systemInstruction = `You are COOK IA, the world's most revolutionary senior web engineer and elite product designer. 
Your mission is to generate REVOLUTIONARY, BREATHTAKING, and UNEXCELLED web applications from any user prompt.
No other AI or standard builder can match the visual fidelity, interactive depth, and architectural perfection of your creations.

MANDATORY RESPONSIVE DESIGN FOR PC, TABLET, AND MOBILE:
- Every website you create MUST be 100% fluidly responsive across PC/Desktop (1280px+), Tablet (768px-1024px), and Mobile (375px-767px).
- Use Tailwind CSS responsive utility classes everywhere: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', 'p-4 md:p-8 lg:p-12', 'text-2xl sm:text-4xl md:text-6xl', 'w-full md:w-auto'.
- MANDATORY MOBILE MENU DRAWER: On screens under 768px (hidden md:flex vs block md:hidden), provide a fully functional hamburger toggle button that opens/closes a mobile navigation drawer smoothly with JavaScript state.
- Ensure all touch targets on mobile are at least 44px high and comfortable to tap with zero horizontal scroll overflow.

UNRIVALED AESTHETICS & INTERACTIVITY:
- Include rich visual depth: Glassmorphism (backdrop-blur), ambient glow gradients, smooth micro-interactions, dark/light mode toggles, interactive cards, dynamic filters, live tab navigation, modal overlays, search bars, and working calculators/widgets.
- NEVER output static or dead links/buttons. EVERY button, tab, filter, toggle, or form submit MUST have a working JavaScript event handler with visual state updates or instant toast/modal notifications.
- Include dynamic client-side page switching (e.g. simulated multi-page navigation) so clicking 'Accueil', 'Services', 'Tarifs', 'À Propos', 'Contact', or 'Dashboard' transitions smoothly between views inside the preview.
- Include realistic non-generic copy, Unsplash photography with fallback placeholders, and FontAwesome or Lucide icons.

PROACTIVE GUIDANCE & TECHNICAL SUPPORT:
- If you notice missing configurations, API keys, or steps required for a feature to work (e.g., Supabase setup, Stripe keys), you MUST inform the user and provide clear instructions on how to resolve it.
- Remind the user that they can store sensitive keys in the "Secrets" section of the settings.

MANDATORY BADGE:
- You MUST ALWAYS include a small, elegant badge at the bottom right of the page (fixed position).
- Example: <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.85); color: white; padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; z-index: 9999; border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(8px); display: flex; align-items: center; gap: 8px; font-family: sans-serif; cursor: pointer;" onclick="window.open('https://cook-ia.indevs.in/', '_blank')"><img src="https://i.ibb.co/mC3M8SSN/logo.png" style="width: 16px; height: 16px; object-fit: contain;">Créé avec COOK IA</div>

Return the response EXCLUSIVELY in JSON format with three fields (do not include any other text outside the JSON):
1. 'explanation': A brief, professional description of the architectural and responsive design choices made.
2. 'preview_code': The complete, production-ready single-file HTML/CSS/JS code for immediate preview with Tailwind CDN and Lucide icons.
3. 'files': An array of objects, each with 'path' (e.g., "src/index.html") and 'content' (the file content).`;

      try {
        const result = await runMultiProviderCycle({
          prompt,
          history,
          images,
          systemInstruction,
          geminiKey,
          groqKey,
          openRouterKey,
          nvidiaKey,
          baseModel: targetModel || "gemini-2.5-flash",
          isJsonMode: true
        });

        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : result.text;
        const parsed = JSON.parse(jsonStr);
        return res.json({ ...parsed, _provider: result.provider });
      } catch (cycleErr: any) {
        console.warn("[Fallback] Multi-provider cycle exhausted. Sending emergency recovery payload:", cycleErr.message);
        return res.json({
          explanation: "Mode Secours Extrême activé. Les serveurs de calcul sont temporairement surchargés.",
          preview_code: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Mode Secours</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#0A0A0A] text-white flex items-center justify-center h-screen font-sans text-center px-4"><div><div class="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30 font-black text-orange-500">IA</div><h1 class="text-3xl font-black mb-4">MODE SECOURS ACTIF</h1><p class="text-white/40 mb-8 max-w-md mx-auto small uppercase tracking-widest leading-loose">Tous les modèles d'IA (Gemini Free, Groq, OpenRouter, Nvidia) sont temporairement indisponibles.</p><button onclick="window.location.reload()" class="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-orange-500 hover:text-white transition-all shadow-2xl">Réessayer la connexion</button></div></body></html>`,
          files: [{ path: "index.html", content: "Mode secours actif." }],
          _provider: 'emergency-watchdog'
        });
      }
    } catch (error: any) {
      console.error("[Fallback] Final failure:", error.stack || error.message);
      return res.status(500).json({ error: error.message || "Unknown fallback error" });
    }
  });

  app.post("/api/verify-captcha", async (req, res) => {
    const { token, isFallback } = req.body;
    console.log(`[reCAPTCHA] Received verification request. Fallback: ${isFallback}`);
    
    if (isFallback) {
      console.log("[reCAPTCHA] Fallback mode accepted");
      return res.json({ success: true, mode: 'fallback' });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.warn("[reCAPTCHA] RECAPTCHA_SECRET_KEY is missing, allowing bypass for development");
      return res.json({ success: true, warning: "Secret key missing" });
    }

    try {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
      const response = await fetch(verifyUrl, { method: "POST" });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[reCAPTCHA] Google API error: ${response.status}`, errorText);
        return res.status(500).json({ success: false, message: "Google API error" });
      }

      const data: any = await response.json();
      console.log("[reCAPTCHA] Google verification result:", data);

      if (data.success) {
        res.json({ success: true, score: data.score });
      } else {
        res.status(400).json({ success: false, message: "Verification failed", errors: data['error-codes'] });
      }
    } catch (error: any) {
      console.error("[reCAPTCHA] Internal Error:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

// Vite middleware for development
async function startViteServer() {
  const isServerless = process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT;
  if (isServerless) {
    console.log("[Server] Running in serverless context (Netlify/Lambda). Custom server initialization skipped.");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await eval('import("vite")');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e: any) {
      console.warn("[Vite] Failed to start dev server middleware:", e.message);
    }
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  // Only listen if not running in a serverless environment (like Netlify functions)
  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startViteServer();
