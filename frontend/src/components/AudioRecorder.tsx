import { useState, useRef } from "react";
import { analyzeAudio } from "../api/backend";
import type { AnalysisResult } from "../types/analysis";

export default function AudioRecorder({
  onResult,
}: {
  onResult: (res: AnalysisResult) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
  mimeType: "audio/webm"
});

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.start();
    setRecording(true);
  }

  async function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
      const file = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });

      setLoading(true);
      const result = await analyzeAudio(file);
      onResult(result);
      setLoading(false);
    };

    setRecording(false);
  }

  return (
    <div>
      {!recording ? (
        <button onClick={startRecording} disabled={loading}>🎙 Start Recording</button>
      ) : (
        <button onClick={stopRecording}>⏹ Stop Recording</button>
      )}

      {loading && <p>Analyzing audio...</p>}
    </div>
  );
}
