import { useState } from "react";
import { analyzeAudio } from "../api/backend";
import type { AnalysisResult } from "../types/analysis";

export default function AudioUpload({
  onResult,
}: {
  onResult: (res: AnalysisResult) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    const result = await analyzeAudio(file);
    onResult(result);
    setLoading(false);
  }

  return (
    <div>
      <input
        type="file"
        accept=".wav"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}
