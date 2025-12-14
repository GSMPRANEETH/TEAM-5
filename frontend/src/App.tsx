import { useState } from "react";
import { UIProvider } from "./contexts/UIContext";
import { useUI } from "./hooks/useUI";
import AudioRecorderEnhanced from "./components/organisms/AudioRecorderEnhanced";
import ResultsPanel from "./components/organisms/ResultsPanel";
import Button from "./components/atoms/Button";
import Badge from "./components/atoms/Badge";
import type { AnalysisResult } from "./types/analysis";

function AppContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { darkMode, toggleDarkMode } = useUI();

  const handleNewAnalysis = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                🎙️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  AI Speech Analysis
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced Personality Insights powered by Multi-Agent AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="primary" size="md">
                🤖 Multi-Agent System
              </Badge>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                How It Works
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Our AI-powered system uses <strong>Faster-Whisper</strong> for speech-to-text, 
                extracts acoustic features, and employs a <strong>multi-agent AI system</strong> with 
                specialized agents for communication, confidence, and personality analysis. 
                Results are enhanced using <strong>RAG (Retrieval-Augmented Generation)</strong> with 
                a ChromaDB knowledge base for personalized insights.
              </p>
            </div>
          </div>
        </div>

        {/* Audio Recorder */}
        <div className="mb-8">
          <AudioRecorderEnhanced onResult={setResult} />
        </div>

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Your Analysis
              </h2>
              <Button variant="secondary" size="md" onClick={handleNewAnalysis}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Analysis
              </Button>
            </div>
            
            <ResultsPanel data={result} />
          </div>
        )}

        {/* Features Grid */}
        {!result && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-2xl mb-4">
                  🎤
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Real-time Recording
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  High-quality audio capture with live duration tracking
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center text-2xl mb-4">
                  📊
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Acoustic Analysis
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Extract pitch, energy, speech rate, and pause patterns
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-2xl mb-4">
                  🤖
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Multi-Agent AI
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Specialized agents for comprehensive personality insights
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl mb-4">
                  🔍
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  RAG-Enhanced
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Knowledge-augmented reports with contextual insights
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 TEAM-5 Speech Analysis Pipeline. Powered by Local LLMs & Multi-Agent AI.
            </p>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Documentation
              </a>
              <span>•</span>
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                API Reference
              </a>
              <span>•</span>
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <UIProvider>
      <AppContent />
    </UIProvider>
  );
}

export default App;
