export interface StyleConfig {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface SectionEditState {
  isActive: boolean;
  sectionId?: string;
  sectionHtml?: string;
  selector?: string;
}

export interface ProjectFile {
  path: string;
  content: string;
}

export interface ActionHistory {
  type: 'read' | 'thought' | 'shell';
  content: string;
  status: 'loading' | 'completed' | 'failed';
  duration?: number;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  code?: string;
  image?: string;
  images?: string[];
  videos?: string[];
  files?: ProjectFile[];
  _provider?: string;
  actionHistory?: ActionHistory[];
  modelName?: string;
  runTime?: number;
  feedback?: 'like' | 'dislike';
}

export type ViewMode = 'preview' | 'code' | 'chat';

export interface WebsiteGenerationResult {
  explanation: string;
  preview_code: string;
  files: ProjectFile[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}
