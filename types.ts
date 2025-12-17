
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
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface AppSettings {
  isInformal: boolean;
  noRules: boolean;
  userName: string;
  userContext: string;
  userJob: string;
  isRadioPlaying: boolean;
  radioStation: 'ava' | 'javan';
}
