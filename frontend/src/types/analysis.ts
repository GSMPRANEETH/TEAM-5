export interface SpeechMetrics {
  pitch_mean?: number;
  energy_mean?: number;
  speech_rate?: number;
  pause_rate?: number;
  [key: string]: number | string | undefined;
}

export interface AgentResult {
  analysis?: string;
  findings?: string;
  recommendations?: string;
  [key: string]: string | undefined;
}

export interface VisualMetrics {
  eye_contact_score: number;
  body_language: string;
  facial_expressions: string;
  lighting_and_framing: string;
  overall_visual_feedback: string;
}

export interface AnalysisResult {
  transcript: string;
  confidence_score: number;
  confidence_label: string;
  final_report: string;
  speech_metrics: SpeechMetrics;
  visual_metrics?: VisualMetrics;
  agent_results: Record<string, AgentResult | string>;
}
