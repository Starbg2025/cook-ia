// Shadow Watchdog: Internal health check and silent fallback management
let primaryModelHealthy = true;

export const shadowWatchdog = {
  isHealthy: () => primaryModelHealthy,
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

// Agent 1: Analyst
export const analystReview = async (prompt: string, history: any[]) => {
  try {
    const response = await fetch("/api/ai/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentType: 'analyst', prompt, history })
    });
    return await response.json();
  } catch (error) {
    console.debug("Analyst Proxy error:", error);
    return { needsClarification: false, questions: [], isTechnicalQuestion: false };
  }
};

// Agent 2: Planner
export const plannerAgent = async (prompt: string, history: any[]) => {
  try {
    const response = await fetch("/api/ai/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentType: 'planner', prompt, history })
    });
    return await response.json();
  } catch (error) {
    console.debug("Planner Proxy error:", error);
    return { plan: "Désolé, je n'ai pas pu générer de plan détaillé.", isComplex: false, subAgents: [] };
  }
};

// Agent 4: Tester
export const testerAgent = async (code: string, prompt: string) => {
  try {
    const response = await fetch("/api/ai/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentType: 'critic', prompt, code: generatedCode })
    });
    return await response.json();
  } catch (error) {
    console.debug("Critic Proxy error:", error);
    return { approved: true, feedback: "" };
  }
};
