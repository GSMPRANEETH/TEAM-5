import { useState, useRef, useEffect } from "react";
import { Mic, Square, Moon, Sun, Loader2, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

import { VideoUpload } from "@/components/molecules/VideoUpload";
import type { AnalysisResult } from "./types/analysis";

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'audio' | 'video'>('audio');
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<number | null>(null);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  async function startRecording() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // More universally supported in modern browsers
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Create a File object from the Blob
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        await handleAudioUpload(file);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setDuration(0);

      durationIntervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err: Error | unknown) {
      console.error("Microphone error:", err);
      setError("Microphone access denied or not available. Please check permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  }

  async function handleAudioUpload(file: File) {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      // Allow dynamic API URL configuration, default to localhost for dev
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: Error | unknown) {
      console.error("Upload error:", err);
      setError((err as Error).message || "An error occurred during analysis. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVideoUpload(file: File) {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/analyze-video`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Video analysis failed");

      const data = await response.json();
      setResult(data);
    } catch (err: Error | unknown) {
      setError((err as Error).message || "An error occurred during video analysis.");
    } finally {
      setLoading(false);
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const normalizeScore = (score: number) => {
    return score <= 1 ? score * 100 : score;
  };

  const formatConfidenceScore = (score: number) => {
    return normalizeScore(score).toFixed(0) + '%';
  };

  const getConfidenceColor = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 80) return "bg-green-500";
    if (normalized >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getConfidenceVariant = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 80) return "success";
    if (normalized >= 60) return "warning";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  AuraSync
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your AI Communication Coach
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Info Alert */}
        <Card className="mb-6 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Welcome to AuraSync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              Record audio or upload a video to receive AI-driven insights on your communication style, confidence, body language, and acoustics.
            </p>
          </CardContent>
        </Card>

        {/* Recording Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Provide Media
              </CardTitle>
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <Button variant={uploadMode === 'audio' ? 'default' : 'ghost'} size="sm" onClick={() => setUploadMode('audio')} className={uploadMode === 'audio' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}>
                  Audio
                </Button>
                <Button variant={uploadMode === 'video' ? 'default' : 'ghost'} size="sm" onClick={() => setUploadMode('video')} className={uploadMode === 'video' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}>
                  Video
                </Button>
              </div>
            </div>
            {uploadMode === 'audio' && recording && (
               <Badge variant="destructive" className="w-fit">
                 <span className="flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                   Recording {formatDuration(duration)}
                 </span>
               </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadMode === 'video' ? (
               <VideoUpload onVideoSelect={handleVideoUpload} disabled={loading} />
            ) : (
            <div className="flex justify-center">
              {!recording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={loading}
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="min-w-[200px]"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              )}
            </div>
            )}

            {loading && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Processing media...</span>
                  <span>Please wait</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!recording && !loading && !result && (
              <div className="p-3 mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  💡 <strong>Tip:</strong> {uploadMode === 'audio' ? 'Speak naturally. The analysis works best with 30-60 seconds of audio.' : 'Upload an MP4 or WebM video showing your face clearly for the best visual analysis.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Your Analysis Results
              </h2>
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                New Analysis
              </Button>
            </div>

            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>Analysis Complete</CardTitle>
                  <Badge variant="success" className="bg-white/20 text-white border-white/30">
                    ✓ Done
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Confidence Score */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Confidence Level
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getConfidenceVariant(result.confidence_score)}>
                        {result.confidence_label}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {formatConfidenceScore(result.confidence_score)}
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${getConfidenceColor(result.confidence_score)} transition-all duration-500`}
                        style={{ width: `${normalizeScore(result.confidence_score)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Accordion Sections */}
                <Accordion type="single" collapsible defaultValue="transcript">
                  <AccordionItem value="transcript">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <span>📝</span>
                        <span className="font-semibold">Transcript</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 text-slate-700 dark:text-slate-300">
                        {result.transcript}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {result.speech_metrics && Object.keys(result.speech_metrics).length > 0 && (
                    <AccordionItem value="metrics">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span>📊</span>
                          <span className="font-semibold">Speech Metrics</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(result.speech_metrics).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {typeof value === 'number' ? value.toFixed(2) : value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {result.visual_metrics && Object.keys(result.visual_metrics).length > 0 && (
                    <AccordionItem value="visuals">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-indigo-600" />
                          <span className="font-semibold">Visual Analysis</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Overall Visual Feedback</h4>
                            <p className="text-sm text-indigo-800 dark:text-indigo-400">{result.visual_metrics.overall_visual_feedback}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Eye Contact Score</div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.visual_metrics.eye_contact_score}/100</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Lighting & Framing</div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.visual_metrics.lighting_and_framing}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Facial Expressions</div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.visual_metrics.facial_expressions}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Body Language</div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.visual_metrics.body_language}</div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {result.agent_results && Object.keys(result.agent_results).length > 0 && (
                    <AccordionItem value="agents">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span>🤖</span>
                          <span className="font-semibold">Agent Analysis</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {Object.entries(result.agent_results).map(([agentName, agentResult]) => (
                            <div key={agentName} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">
                                {agentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {typeof agentResult === 'string' ? agentResult : JSON.stringify(agentResult, null, 2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  <AccordionItem value="report">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <span>📄</span>
                        <span className="font-semibold">Personality Report</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {result.final_report}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    📥 Download
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    🔗 Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid (shown when no results) */}
        {!result && (
          <div className="mt-8">
            <h3 className="text-center text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
              Why AuraSync?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: "📹", title: "Video & Visual Cues", desc: "Get feedback on eye contact, posture, and facial expressions." },
                { icon: "📊", title: "Acoustic Analysis", desc: "Pitch, energy, and speaking rate evaluated instantly." },
                { icon: "🤖", title: "Multi-Agent AI", desc: "Specialized coaches for Confidence, Personality, and Tone." },
                { icon: "⚡", title: "100% Free Core", desc: "Essential processing is entirely free, powered by efficient models." },
              ].map((feature, idx) => (
                <Card key={idx} className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg flex items-center justify-center text-2xl mb-2">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-sm">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">{feature.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} AuraSync • Your AI Communication Coach
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
