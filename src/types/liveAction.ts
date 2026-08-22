export type LiveActionType = 
  | 'analysis'
  | 'file_operation'
  | 'code_generation'
  | 'terminal'
  | 'build'
  | 'preview'
  | 'tool_call'
  | 'error';

export type LiveActionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type LiveActionGroup = 'analysis' | 'files' | 'verification' | 'system';

export interface LiveActionDiffLine {
  type: 'add' | 'del' | 'normal';
  text: string;
  lineNumber?: number;
}

export interface LiveActionDiff {
  path: string;
  added: number;
  removed: number;
  lines: LiveActionDiffLine[];
}

export interface LiveActionDetails {
  path?: string;
  command?: string;
  output?: string;
  error?: string;
  diff?: LiveActionDiff;
  sizeBytes?: number;
  modelUsed?: string;
  filesCount?: number;
  buttonsChecked?: number;
  deadButtonsFixed?: number;
  previewUrl?: string;
}

export interface LiveActionEvent {
  id: string;
  taskId: string;
  timestamp: string;
  type: LiveActionType;
  status: LiveActionStatus;
  tool?: string;
  title: string;
  group: LiveActionGroup;
  details?: LiveActionDetails;
  durationMs?: number;
}

export interface LiveActionTask {
  id: string;
  prompt: string;
  createdAt: string;
  completedAt?: string;
  status: LiveActionStatus;
  events: LiveActionEvent[];
  totalDurationMs?: number;
  error?: string;
}
