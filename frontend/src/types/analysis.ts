// Communication analysis output structure
export interface CommunicationAnalysis {
  communication_score?: number;
  clarity_level?: string;
  fluency_level?: string;
  speech_pacing?: string;
  key_observations?: string[];
  communication_strengths?: string[];
  communication_gaps?: string[];
  improvement_suggestions?: string[];
  [key: string]: string | number | string[] | undefined;
}

// Confidence analysis output structure
export interface ConfidenceAnalysis {
  confidence_score?: number;
  confidence_level?: string;
  emotional_tone?: string;
  vocal_energy_assessment?: string;
  confidence_indicators?: string[];
  possible_challenges?: string[];
  confidence_enhancement_tips?: string[];
  [key: string]: string | number | string[] | undefined;
}

// Personality analysis output structure
export interface PersonalityAnalysis {
  personality_type?: string;
  interaction_style?: string;
  professional_presence?: string;
  key_personality_traits?: string[];
  strengths_in_interaction?: string[];
  growth_opportunities?: string[];
  overall_summary?: string;
  [key: string]: string | number | string[] | undefined;
}

export interface SpeechMetrics {
  speech_rate?: number;
  pause_ratio?: number;
  energy_level?: string;
  "Energy (Loudness)"?: number;
  "Pitch Mean (semitones)"?: number;
  "Pitch Variance"?: number;
  Jitter?: number;
  "Shimmer (dB)"?: number;
  "Speech Duration (sec)"?: number;
  "Total Pause Time (sec)"?: number;
  "Total Words"?: number;
  [key: string]: number | string | undefined;
}

export interface AgentResults {
  communication_analysis?: CommunicationAnalysis;
  confidence_emotion_analysis?: ConfidenceAnalysis;
  personality_analysis?: PersonalityAnalysis;
  [key: string]: CommunicationAnalysis | ConfidenceAnalysis | PersonalityAnalysis | undefined;
}

export interface AnalysisResult {
  transcript: string;
  confidence_score: number;
  confidence_label: string;
  final_report: string;
  speech_metrics: SpeechMetrics;
  agent_results: AgentResults;
}
