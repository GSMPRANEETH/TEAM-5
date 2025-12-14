export interface AnalysisResult {
  transcript: string;
  confidence_score: number;
  confidence_label: string;
  final_report: string;
  speech_metrics: Record<string, any>;
  agent_results: Record<string, any>;
}
