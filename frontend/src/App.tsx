import type { AnalysisResult } from "./types/analysis";

export default function ResultView({ data }: { data: AnalysisResult }) {
  return (
    <div>
      <h3>Transcript</h3>
      <p>{data.transcript}</p>

      <h3>Confidence</h3>
      <p>
        {data.confidence_label} ({data.confidence_score})
      </p>

      <h3>Final Personality Report</h3>
      <p>{data.final_report}</p>
    </div>
  );
}
