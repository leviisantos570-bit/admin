export interface KeywordResult {
  term: string;
  volume: number;
  competition: number;
  difficulty: string;
}

export interface BlueOceanNiche {
  title: string;
  reasoning: string;
}

export interface TitleIdea {
  title: string;
  score: number;
  rationale: string;
}

export interface ScriptPoint {
  header: string;
  content: string;
}

export interface ScriptArchive {
  hook: string;
  intro: string;
  points: ScriptPoint[];
  cta: string;
}
