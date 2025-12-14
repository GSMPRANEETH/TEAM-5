import * as Accordion from "@radix-ui/react-accordion";
import Badge from "../atoms/Badge";
import ConfidenceScore from "../atoms/ConfidenceScore";
import type { AnalysisResult } from "../../types/analysis";

export interface ResultsPanelProps {
  data: AnalysisResult;
  className?: string;
}

export default function ResultsPanel({ data, className = "" }: ResultsPanelProps) {
  const renderMetricCard = (title: string, value: number | string | undefined, icon: string) => {
    if (value === undefined || value === null) return null;
    
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{icon}</span>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </p>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            ✨ Analysis Results
          </h2>
          <Badge variant="success" size="md">
            Complete
          </Badge>
        </div>
      </div>

      {/* View Mode Toggle - Removed unused state, keeping UI for future implementation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            disabled
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white opacity-50 cursor-not-allowed"
          >
            Full Response
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 opacity-50 cursor-not-allowed"
          >
            Key Findings (Coming Soon)
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Confidence Score */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Confidence Score
          </h3>
          <ConfidenceScore
            score={data.confidence_score}
            label={data.confidence_label}
            showBar={true}
            size="lg"
          />
        </div>

        {/* Transcript Section */}
        <Accordion.Root type="single" collapsible defaultValue="transcript">
          <Accordion.Item value="transcript" className="border-b border-gray-200 dark:border-gray-700">
            <Accordion.Header>
              <Accordion.Trigger className="flex items-center justify-between w-full py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded px-2 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Transcript
                  </h3>
                </div>
                <svg
                  className="w-5 h-5 text-gray-500 transition-transform duration-200 accordion-chevron"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-2 pb-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {data.transcript}
                </p>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* Speech Metrics */}
          {data.speech_metrics && Object.keys(data.speech_metrics).length > 0 && (
            <Accordion.Item value="metrics" className="border-b border-gray-200 dark:border-gray-700">
              <Accordion.Header>
                <Accordion.Trigger className="flex items-center justify-between w-full py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded px-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Speech Metrics
                    </h3>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-500 transition-transform duration-200 accordion-chevron"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderMetricCard('Pitch Mean', data.speech_metrics.pitch_mean, '🎵')}
                  {renderMetricCard('Energy', data.speech_metrics.energy_mean, '⚡')}
                  {renderMetricCard('Speech Rate', data.speech_metrics.speech_rate, '🏃')}
                  {renderMetricCard('Pause Rate', data.speech_metrics.pause_rate, '⏸️')}
                  {Object.entries(data.speech_metrics)
                    .filter(([key]) => !['pitch_mean', 'energy_mean', 'speech_rate', 'pause_rate'].includes(key))
                    .map(([key, value]) => renderMetricCard(key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value, '📈'))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )}

          {/* Agent Results */}
          {data.agent_results && Object.keys(data.agent_results).length > 0 && (
            <Accordion.Item value="agents" className="border-b border-gray-200 dark:border-gray-700">
              <Accordion.Header>
                <Accordion.Trigger className="flex items-center justify-between w-full py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded px-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Agent Analysis
                    </h3>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-500 transition-transform duration-200 accordion-chevron"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-2 pb-4">
                <div className="space-y-4">
                  {Object.entries(data.agent_results).map(([agentName, result]) => (
                    <div key={agentName} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        {agentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )}

          {/* Final Report */}
          <Accordion.Item value="report">
            <Accordion.Header>
              <Accordion.Trigger className="flex items-center justify-between w-full py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded px-2 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Final Personality Report
                  </h3>
                </div>
                <svg
                  className="w-5 h-5 text-gray-500 transition-transform duration-200 accordion-chevron"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-2 pb-4">
              <div className="bg-gradient-to-br from-accent-50 to-purple-50 dark:from-accent-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-accent-200 dark:border-accent-800">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {data.final_report}
                  </p>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            📥 Download Report
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            🔗 Share Results
          </button>
        </div>
      </div>

      <style>{`
        .accordion-chevron {
          transition: transform 0.2s;
        }
        [data-state="open"] .accordion-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
