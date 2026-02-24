export interface Message {
  role: 'user' | 'model';
  content: string;
  code?: string;
}

export type ViewMode = 'preview' | 'code';

export interface WebsiteGenerationResult {
  explanation: string;
  code: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}
