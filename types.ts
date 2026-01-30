
export enum AppMode {
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  VOICE = 'VOICE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingUrls?: { uri: string; title: string }[];
  thinking?: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export type ThemeColor = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';

export interface AppSettings {
  isInformal: boolean;
  noRules: boolean;
  userName: string;
  userContext: string;
  userJob: string;
  isRadioPlaying: boolean;
  radioStation: 'ava' | 'javan';
  themeColor: ThemeColor;
  aiCreativity: number;
  responseLength: 'brief' | 'detailed';
  autoSearch: boolean;
  fontSize: 'small' | 'medium' | 'large';
  showTimestamp: boolean;
  // Advanced Root Settings
  enableThinking: boolean;
  thinkingBudget: number;
  modelTier: 'flash' | 'pro';
  systemOverclock: boolean;
  showDebugLogs: boolean;
  // New Optimized Settings
  enableAnimations: boolean;
  autoClearHistory: boolean;
  voiceSpeed: number;
  languageMode: 'auto' | 'farsi' | 'english';
  // UI Expansion
  neuralGlow: boolean;
  glassOpacity: number;
}
