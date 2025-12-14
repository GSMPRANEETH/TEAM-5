import { useState, useRef } from "react";
import Button from "../atoms/Button";
import Badge from "../atoms/Badge";
import LoadingSpinner from "../atoms/LoadingSpinner";
import ProgressBar from "../molecules/ProgressBar";
import type { ProgressStage } from "../molecules/ProgressBar";
import { analyzeAudio } from "../../api/backend";
import type { AnalysisResult } from "../../types/analysis";

export interface AudioRecorderEnhancedProps {
  onResult: (res: AnalysisResult) => void;
  className?: string;
}

export default function AudioRecorderEnhanced({
  onResult,
  className = "",
}: AudioRecorderEnhancedProps) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<number | null>(null);

  const stages: ProgressStage[] = [
    {
      label: "Recording",
      status: recording ? "active" : loading ? "complete" : "pending",
    },
    {
      label: "Preprocessing",
      status: processingStage === "preprocessing" ? "active" : 
              processingStage === "transcribing" || processingStage === "analyzing" || processingStage === "complete" ? "complete" : 
              "pending",
    },
    {
      label: "Transcribing",
      status: processingStage === "transcribing" ? "active" : 
              processingStage === "analyzing" || processingStage === "complete" ? "complete" : 
              "pending",
    },
    {
      label: "Analyzing",
      status: processingStage === "analyzing" ? "active" : 
              processingStage === "complete" ? "complete" : 
              "pending",
    },
  ];

  async function startRecording() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Failed to access microphone. Please grant permission and try again.");
      console.error("Recording error:", err);
    }
  }

  async function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    recorder.stop();
    recorder.stream.getTracks().forEach(track => track.stop());
    
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
      const file = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });

      setLoading(true);
      setRecording(false);
      
      try {
        // Set processing stages to show progress
        setProcessingStage("preprocessing");
        
        // Start the actual analysis
        setProcessingStage("transcribing");
        const result = await analyzeAudio(file);
        
        setProcessingStage("analyzing");
        
        // Allow brief display of final stage before showing results
        setTimeout(() => {
          setProcessingStage("complete");
          onResult(result);
          setError(null);
        }, 300);
      } catch (err) {
        setError("Analysis failed. Please try again.");
        console.error("Analysis error:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setProcessingStage(""), 2000);
      }
    };
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          🎙️ Voice Recorder
        </h3>
        {recording && (
          <Badge variant="error" size="md">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              Recording {formatDuration(duration)}
            </span>
          </Badge>
        )}
      </div>

      {/* Progress Stages */}
      {(recording || loading || processingStage) && (
        <div className="mb-6">
          <ProgressBar stages={stages} />
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          {!recording ? (
            <Button
              variant="primary"
              size="lg"
              onClick={startRecording}
              disabled={loading}
              className="min-w-[180px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Recording
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="lg"
              onClick={stopRecording}
              className="min-w-[180px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Recording
            </Button>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <LoadingSpinner size="sm" />
            <span className="text-sm">
              {processingStage === "preprocessing" && "Processing audio..."}
              {processingStage === "transcribing" && "Transcribing speech..."}
              {processingStage === "analyzing" && "Analyzing personality traits..."}
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!recording && !loading && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> Speak naturally for 30-60 seconds for best results. 
            The AI will analyze your speech patterns, tone, and communication style.
          </p>
        </div>
      )}
    </div>
  );
}
