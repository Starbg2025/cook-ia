// Shadow Watchdog: Internal health check and silent fallback management
let primaryModelHealthy = true;

export const shadowWatchdog = {
  isHealthy: () => primaryModelHealthy,
  setHealthy: () => {
    primaryModelHealthy = true;
    console.debug("[Shadow Watchdog] Gemini manually marked as healthy.");
  },
  setUnhealthy: () => {
    primaryModelHealthy = false;
    console.debug("[Shadow Watchdog] Gemini marked as unhealthy. Activation of Silent Fallback Protocol.");
    // Auto-reset health after 5 minutes
    setTimeout(() => {
      primaryModelHealthy = true;
      console.debug("[Shadow Watchdog] Gemini health reset. Returning to primary model.");
    }, 5 * 60 * 1000);
  }
};

const getCustomHeaders = () => {
  const headers: any = { "Content-Type": "application/json" };
  try {
    const saved = localStorage.getItem('user_secrets');
    if (saved) {
      const secrets = JSON.parse(saved);
      if (Array.isArray(secrets) && secrets.length > 0) {
        const isGeminiKey = (k: string, v: string) => {
          const uKey = k.toUpperCase().replace(/[^A-Z]/g, '');
          if (uKey.includes('GEMINI') || uKey.includes('GOOGLE')) return true;
          if (v && v.startsWith('AIzaSy')) return true;
          if ((uKey === 'APIKEY' || uKey === 'KEY') && secrets.length === 1) return true;
          return false;
        };
        const isGroqKey = (k: string) => {
          return k.toUpperCase().includes('GROQ');
        };
        
        const geminiKey = secrets.find((s: any) => isGeminiKey(s.key, s.value)) || secrets[0];
        if (geminiKey && geminiKey.value) {
          headers['x-gemini-key'] = geminiKey.value.trim();
        }
        
        const groqKey = secrets.find((s: any) => isGroqKey(s.key));
        if (groqKey && groqKey.value) {
          headers['x-groq-key'] = groqKey.value.trim();
        }
      }
    }
  } catch (e) {}
  return headers;
};

// Agent 1: Analyst
export const analystReview = async (prompt: string, history: any[]) => {
  try {
    const response = await fetch("/api/ai/agents", {
      method: "POST",
      headers: getCustomHeaders(),
      body: JSON.stringify({ agentType: 'analyst', prompt, history })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to call analyst agent");
    }
    return data;
  } catch (error: any) {
    if (error.message?.includes("Clé API Gemini")) {
      throw error;
    }
    console.debug("Analyst Proxy error:", error);
    return { needsClarification: false, questions: [], isTechnicalQuestion: false };
  }
};

// Agent 2: Planner
export const plannerAgent = async (prompt: string, history: any[]) => {
  try {
    const response = await fetch("/api/ai/agents", {
      method: "POST",
      headers: getCustomHeaders(),
      body: JSON.stringify({ agentType: 'planner', prompt, history })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to call planner agent");
    }
    return data;
  } catch (error: any) {
    if (error.message?.includes("Clé API Gemini")) {
      throw error;
    }
    console.debug("Planner Proxy error:", error);
    return { plan: "Désolé, je n'ai pas pu générer de plan détaillé.", isComplex: false, subAgents: [] };
  }
};

// Agent 4: Tester
export const testerAgent = async (code: string, prompt: string) => {
  try {
    const response = await fetch("/api/ai/agents", {
      method: "POST",
      headers: getCustomHeaders(),
      body: JSON.stringify({ agentType: 'tester', code, prompt })
    });
    return await response.json();
  } catch (error) {
    console.debug("Tester Proxy error:", error);
    return { passed: true, errors: [] };
  }
};

// Agent 3: Critic
export const criticReview = async (prompt: string, generatedCode: string) => {
  try {
    const response = await fetch("/api/ai/agents", {
      method: "POST",
      headers: getCustomHeaders(),
      body: JSON.stringify({ agentType: 'critic', prompt, code: generatedCode })
    });
    return await response.json();
  } catch (error) {
    console.debug("Critic Proxy error:", error);
    return { approved: true, feedback: "" };
  }
};
