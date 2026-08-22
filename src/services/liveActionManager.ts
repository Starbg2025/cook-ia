import { 
  LiveActionEvent, 
  LiveActionTask, 
  LiveActionType, 
  LiveActionGroup, 
  LiveActionStatus,
  LiveActionDiff,
  LiveActionDiffLine,
  LiveActionDetails 
} from '../types/liveAction';

// Sensitive keys / tokens patterns to redact
const SENSITIVE_PATTERNS = [
  /AIzaSy[a-zA-Z0-9_\-]{33}/g,
  /gsk_[a-zA-Z0-9]{32,}/g,
  /sk-[a-zA-Z0-9]{20,}/g,
  /ghp_[a-zA-Z0-9]{20,}/g,
  /eyJ[a-zA-Z0-9_\-]{20,}\.[a-zA-Z0-9_\-]{20,}\.[a-zA-Z0-9_\-]{20,}/g,
  /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
  /(password|secret|key|token)["']?\s*[:=]\s*["']?([^"',\s}]+)/gi
];

export function redactSensitiveData(input: string): string {
  if (!input || typeof input !== 'string') return input;
  let sanitized = input;
  sanitized = sanitized.replace(/AIzaSy[a-zA-Z0-9_\-]{33}/g, 'AIzaSy*******************************');
  sanitized = sanitized.replace(/gsk_[a-zA-Z0-9]{24,}/g, 'gsk_************************');
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, 'sk-********************');
  sanitized = sanitized.replace(/ghp_[a-zA-Z0-9]{20,}/g, 'ghp_********************');
  return sanitized;
}

/**
 * Calculates a genuine line-by-line diff between two file versions
 */
export function calculateLineDiff(path: string, oldContent: string = '', newContent: string = ''): LiveActionDiff {
  const oldLines = oldContent ? oldContent.split('\n') : [];
  const newLines = newContent ? newContent.split('\n') : [];
  
  const diffLines: LiveActionDiffLine[] = [];
  let added = 0;
  let removed = 0;

  // Simple and robust LCS-based diff for concise file change inspection
  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      // Unchanged line
      if (diffLines.length > 0 && diffLines[diffLines.length - 1].type !== 'normal') {
        diffLines.push({ type: 'normal', text: oldLines[i], lineNumber: j + 1 });
      }
      i++;
      j++;
    } else {
      // Lookahead to find match
      let matchInNew = -1;
      for (let k = j; k < Math.min(j + 15, newLines.length); k++) {
        if (i < oldLines.length && oldLines[i] === newLines[k]) {
          matchInNew = k;
          break;
        }
      }

      let matchInOld = -1;
      for (let k = i; k < Math.min(i + 15, oldLines.length); k++) {
        if (j < newLines.length && newLines[j] === oldLines[k]) {
          matchInOld = k;
          break;
        }
      }

      if (matchInNew !== -1 && (matchInOld === -1 || (matchInNew - j) <= (matchInOld - i))) {
        // Lines were added in new
        while (j < matchInNew) {
          diffLines.push({ type: 'add', text: newLines[j], lineNumber: j + 1 });
          added++;
          j++;
        }
      } else if (matchInOld !== -1) {
        // Lines were removed in old
        while (i < matchInOld) {
          diffLines.push({ type: 'del', text: oldLines[i], lineNumber: i + 1 });
          removed++;
          i++;
        }
      } else {
        if (i < oldLines.length) {
          diffLines.push({ type: 'del', text: oldLines[i], lineNumber: i + 1 });
          removed++;
          i++;
        }
        if (j < newLines.length) {
          diffLines.push({ type: 'add', text: newLines[j], lineNumber: j + 1 });
          added++;
          j++;
        }
      }
    }

    // Limit maximum diff lines shown in UI for high performance
    if (diffLines.length > 120) {
      break;
    }
  }

  // If old file was empty, count total new lines as added
  if (oldLines.length === 0) {
    added = newLines.length;
  }

  return {
    path,
    added: Math.max(added, newLines.length > 0 && oldLines.length === 0 ? newLines.length : 0),
    removed,
    lines: diffLines.slice(0, 100)
  };
}

type TaskListener = (task: LiveActionTask) => void;

class LiveActionManager {
  private tasks: Map<string, LiveActionTask> = new Map();
  private eventStartTimes: Map<string, number> = new Map();
  private taskStartTimes: Map<string, number> = new Map();
  private listeners: Map<string, Set<TaskListener>> = new Map();
  private globalListeners: Set<TaskListener> = new Set();
  private activeTaskControllers: Map<string, AbortController> = new Map();

  constructor() {
    // Restore past tasks from localStorage if available
    try {
      const saved = localStorage.getItem('cook_ia_live_tasks_cache');
      if (saved) {
        const parsed: LiveActionTask[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(t => {
            if (t && t.id) this.tasks.set(t.id, t);
          });
        }
      }
    } catch {}
  }

  private persist() {
    try {
      const recentTasks = Array.from(this.tasks.values()).slice(-20);
      localStorage.setItem('cook_ia_live_tasks_cache', JSON.stringify(recentTasks));
    } catch {}
  }

  public getTask(taskId: string): LiveActionTask | undefined {
    return this.tasks.get(taskId);
  }

  public createTask(prompt: string, controller?: AbortController): LiveActionTask {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const task: LiveActionTask = {
      id: taskId,
      prompt: redactSensitiveData(prompt),
      createdAt: new Date().toISOString(),
      status: 'running',
      events: []
    };

    this.tasks.set(taskId, task);
    this.taskStartTimes.set(taskId, performance.now());
    if (controller) {
      this.activeTaskControllers.set(taskId, controller);
    }
    this.notify(task);
    this.persist();
    return task;
  }

  public startEvent(
    taskId: string,
    params: {
      type: LiveActionType;
      group: LiveActionGroup;
      tool?: string;
      title: string;
      details?: LiveActionDetails;
    }
  ): string {
    const task = this.tasks.get(taskId);
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    if (!task) return eventId;

    const event: LiveActionEvent = {
      id: eventId,
      taskId,
      timestamp: new Date().toISOString(),
      type: params.type,
      status: 'running',
      group: params.group,
      tool: params.tool,
      title: redactSensitiveData(params.title),
      details: params.details ? this.sanitizeDetails(params.details) : undefined
    };

    task.events.push(event);
    this.eventStartTimes.set(eventId, performance.now());
    this.notify(task);
    return eventId;
  }

  public updateEvent(
    taskId: string, 
    eventId: string, 
    updates: Partial<LiveActionEvent>
  ) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const eventIndex = task.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const existing = task.events[eventIndex];
    task.events[eventIndex] = {
      ...existing,
      ...updates,
      title: updates.title ? redactSensitiveData(updates.title) : existing.title,
      details: updates.details ? this.sanitizeDetails(updates.details) : existing.details
    };

    this.notify(task);
  }

  public completeEvent(
    taskId: string, 
    eventId: string, 
    updates?: {
      title?: string;
      details?: LiveActionDetails;
    }
  ) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const eventIndex = task.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const startTime = this.eventStartTimes.get(eventId) || performance.now();
    const durationMs = Math.round(performance.now() - startTime);

    const existing = task.events[eventIndex];
    task.events[eventIndex] = {
      ...existing,
      status: 'completed',
      durationMs,
      title: updates?.title ? redactSensitiveData(updates.title) : existing.title,
      details: updates?.details ? this.sanitizeDetails(updates.details) : existing.details
    };

    this.eventStartTimes.delete(eventId);
    this.notify(task);
    this.persist();
  }

  public failEvent(
    taskId: string, 
    eventId: string, 
    error: string, 
    details?: LiveActionDetails
  ) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const eventIndex = task.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const startTime = this.eventStartTimes.get(eventId) || performance.now();
    const durationMs = Math.round(performance.now() - startTime);

    const existing = task.events[eventIndex];
    task.events[eventIndex] = {
      ...existing,
      status: 'failed',
      durationMs,
      details: {
        ...existing.details,
        ...(details ? this.sanitizeDetails(details) : {}),
        error: redactSensitiveData(error)
      }
    };

    this.eventStartTimes.delete(eventId);
    this.notify(task);
    this.persist();
  }

  public cancelTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const controller = this.activeTaskControllers.get(taskId);
    if (controller) {
      try {
        controller.abort();
      } catch {}
      this.activeTaskControllers.delete(taskId);
    }

    const taskStartTime = this.taskStartTimes.get(taskId) || performance.now();
    const totalDurationMs = Math.round(performance.now() - taskStartTime);

    task.status = 'cancelled';
    task.completedAt = new Date().toISOString();
    task.totalDurationMs = totalDurationMs;

    // Mark running events as cancelled
    task.events.forEach(e => {
      if (e.status === 'running' || e.status === 'pending') {
        e.status = 'cancelled';
      }
    });

    this.notify(task);
    this.persist();
  }

  public finishTask(taskId: string, status: 'completed' | 'failed' | 'cancelled' = 'completed', error?: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const taskStartTime = this.taskStartTimes.get(taskId) || performance.now();
    const totalDurationMs = Math.round(performance.now() - taskStartTime);

    task.status = status;
    task.completedAt = new Date().toISOString();
    task.totalDurationMs = totalDurationMs;
    if (error) task.error = redactSensitiveData(error);

    // Make sure no leftover events remain stuck in running
    task.events.forEach(e => {
      if (e.status === 'running' || e.status === 'pending') {
        e.status = status === 'completed' ? 'completed' : 'failed';
      }
    });

    this.activeTaskControllers.delete(taskId);
    this.notify(task);
    this.persist();
  }

  public subscribe(taskId: string, listener: TaskListener): () => void {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, new Set());
    }
    this.listeners.get(taskId)!.add(listener);

    const existingTask = this.tasks.get(taskId);
    if (existingTask) {
      listener(existingTask);
    }

    return () => {
      this.listeners.get(taskId)?.delete(listener);
    };
  }

  public subscribeAll(listener: TaskListener): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  private notify(task: LiveActionTask) {
    const taskListeners = this.listeners.get(task.id);
    if (taskListeners) {
      taskListeners.forEach(l => {
        try { l(task); } catch (e) { console.error("[LiveActionManager] Listener error:", e); }
      });
    }

    this.globalListeners.forEach(l => {
      try { l(task); } catch (e) { console.error("[LiveActionManager] Global listener error:", e); }
    });
  }

  private sanitizeDetails(details: LiveActionDetails): LiveActionDetails {
    const sanitized: LiveActionDetails = { ...details };
    if (sanitized.command) sanitized.command = redactSensitiveData(sanitized.command);
    if (sanitized.output) sanitized.output = redactSensitiveData(sanitized.output);
    if (sanitized.error) sanitized.error = redactSensitiveData(sanitized.error);
    return sanitized;
  }
}

export const liveActionManager = new LiveActionManager();
