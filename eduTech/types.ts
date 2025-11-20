
export interface Node {
  id: string;
  label: string;
  status: 'known' | 'fuzzy' | 'unknown' | 'new';
  val: number;
  category: string;
  description?: string;
}

export interface Link {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface QuizData {
  question: string;
  options: string[];
  answer: number;
  feedback: string;
}

export interface AnalysisResult {
  summary: string;
  answer: string; // AI Answer added
  concepts: {
    label: string;
    category: string;
    status: 'unknown' | 'fuzzy' | 'known';
    description: string;
  }[];
  prerequisites: string[];
}

export interface MetaResult {
  score: number;
  status: 'known' | 'fuzzy' | 'unknown';
  feedback: string;
  nextStep: string;
}

// New: Folder Structure for Sidebar
export interface FolderStructure {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FolderStructure[];
  nodeId?: string; // if type is file
  isOpen?: boolean;
}

export type ScreenState = 'onboarding' | 'input' | 'graph' | 'metacheck' | 'quiz' | 'update' | 'daily' | 'dashboard';
