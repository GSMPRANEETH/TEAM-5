export interface SpeechMetrics {
  speech_rate: number;
  pause_ratio: number;
  energy_level: string;
  [key: string]: number | string;
}

export interface AgentAnalysis {
  [key: string]: string | number | string[] | number[] | Record<string, unknown>;
}

export interface AgentResults {
  communication_analysis?: AgentAnalysis;
  confidence_emotion_analysis?: AgentAnalysis;
  personality_analysis?: AgentAnalysis;
  [key: string]: AgentAnalysis | undefined;
}

export interface AnalysisResult {
  transcript: string;
  confidence_score: number;
  confidence_label: string;
  final_report: string;
  speech_metrics: SpeechMetrics;
  agent_results: AgentResults;
}
