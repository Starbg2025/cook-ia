import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

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
        task.result = { url: "https://sync.cook.ia/deploy/success" };
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
