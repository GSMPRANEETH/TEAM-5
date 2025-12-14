import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import ResultView from "./components/ResultView";
import type { AnalysisResult } from "./types/analysis";

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎙 AI Speech Personality Analysis</h2>

      <AudioRecorder onResult={setResult} />

      {result && <ResultView data={result} />}
    </div>
  );
}

export default App;
