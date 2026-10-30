export type Genre =
  | "Action"
  | "Thriller"
  | "Horror"
  | "Sci-Fi"
  | "Romance"
  | "Drama";

export type Language = "en" | "my";

export type LengthMinutes = 1 | 3;

export interface SceneCue {
  timestamp: string;
  tag: string;
  narration_excerpt: string;
}

export interface RecapScript {
  hook: string;
  plot_summary: string;
  outro: string;
  full_script: string;
  scene_cues: SceneCue[];
  provider?: "groq" | "openai" | "mock";
}

export interface GenerateScriptRequest {
  title: string;
  genre: Genre;
  language: Language;
  lengthMinutes: LengthMinutes;
}
