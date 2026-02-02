
export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female' | 'other';
}

export interface FortuneResult {
  overallScore: number;
  summary: string;
  categories: {
    wealth: number;
    career: number;
    love: number;
    health: number;
  };
  advice: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  poem: string;
  auraColor?: string; // Analysis of user's "aura"
  vibeTag?: string; // A catchy tag for the day
  alignmentFigure?: string; // The historical figure aligned with today
  alignmentScore?: number; // Resonance score
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  SHAKING_STICK = 'SHAKING_STICK',
  DAILY_THOUGHT = 'DAILY_THOUGHT',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
  ALIGNMENT = 'ALIGNMENT',
  RESULT = 'RESULT'
}
