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

export interface Message {
  role: 'user' | 'model';
  content: string;
  code?: string;
  image?: string; // Keep for backward compatibility if needed, but we'll use images
  images?: string[];
  videos?: string[];
  files?: ProjectFile[];
}

export type ViewMode = 'preview' | 'code';

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
