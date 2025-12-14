// Communication analysis output structure
// TypeScript will only type-check these known properties
export interface CommunicationAnalysis {
  communication_score?: number;
  clarity_level?: string;
  fluency_level?: string;
  speech_pacing?: string;
  key_observations?: string[];
  communication_strengths?: string[];
  communication_gaps?: string[];
  improvement_suggestions?: string[];
}

// Confidence analysis output structure
// TypeScript will only type-check these known properties
export interface ConfidenceAnalysis {
  confidence_score?: number;
  confidence_level?: string;
  emotional_tone?: string;
  vocal_energy_assessment?: string;
  confidence_indicators?: string[];
  possible_challenges?: string[];
  confidence_enhancement_tips?: string[];
}

// Personality analysis output structure
// TypeScript will only type-check these known properties
export interface PersonalityAnalysis {
  personality_type?: string;
  interaction_style?: string;
  professional_presence?: string;
  key_personality_traits?: string[];
  strengths_in_interaction?: string[];
  growth_opportunities?: string[];
  overall_summary?: string;
}

// Speech metrics from audio analysis
// These are the specific metrics returned by the backend speech_features.py
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
}

// Agent results container
// Only three specific analysis types are returned by the backend
export interface AgentResults {
  communication_analysis?: CommunicationAnalysis;
  confidence_emotion_analysis?: ConfidenceAnalysis;
  personality_analysis?: PersonalityAnalysis;
}

export interface AnalysisResult {
  transcript: string;
  confidence_score: number;
  confidence_label: string;
  final_report: string;
  speech_metrics: SpeechMetrics;
  agent_results: AgentResults;
}
