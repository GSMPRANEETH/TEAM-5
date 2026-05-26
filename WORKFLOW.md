# AuraSync: Multi-Modal Communication Analysis Workflow

AuraSync is an AI-powered communication coach that evaluates both **Audio (Acoustics + Speech)** and **Video (Visual Cues)** through a sophisticated multi-agent pipeline backed by Retrieval-Augmented Generation (RAG).

The system prioritizes free-tier APIs (NVIDIA NIM for text/agents and Gemini 1.5 Flash for vision) with zero developer cost.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    User([User]) -->|Uploads/Records Audio or Video| UI[AuraSync Frontend (React)]

    UI -->|POST /analyze-video| APV[Video Endpoint]
    UI -->|POST /analyze| APA[Audio Endpoint]

    subgraph "Visual Analysis (Video Only)"
        APV --> Gem[Gemini 1.5 Flash Vision API]
        Gem -->|Visual Metrics Extraction| VisualOut[Visual Cues: Eye Contact, Posture, Expressions]
        APV --> Ext[Audio Extraction via MoviePy]
        Ext --> APA
    end

    subgraph "Acoustic & Speech Analysis"
        APA --> STT[Faster-Whisper STT]
        STT -->|Transcript| AgentOrch{Agent Orchestrator}

        APA --> AcousticFeat[Librosa / OpenSMILE / Silero]
        AcousticFeat -->|Speech Rate, Pitch, Energy| AgentOrch
    end

    subgraph "Multi-Agent System & RAG"
        KB[(ChromaDB Vector Store)]
        AgentOrch --> CommAg[Communication Agent]
        AgentOrch --> ConfAg[Confidence Agent]
        AgentOrch --> PersAg[Personality Agent]

        CommAg -->|Semantic Search| KB
        ConfAg -->|Semantic Search| KB
        PersAg -->|Semantic Search| KB

        KB -->|Domain Knowledge| Llama[NVIDIA NIM: meta/llama3-8b-instruct]
        CommAg -.-> Llama
        ConfAg -.-> Llama
        PersAg -.-> Llama

        Llama -->|Structured JSON Feedback| ReportGen[Final Report Generator]
    end

    VisualOut --> ReportGen
    ReportGen -->|Consolidated Results| API_Response[JSON Response]
    API_Response --> UI
```

---

## 2. Step-by-Step Processing Flow

### Phase A: Input Handling & Separation
1. **User Submission:** The user records live audio, uploads an audio file (`.wav`, `.mp3`), or uploads a video file (`.mp4`, `.webm`) through the React frontend.
2. **Video Processing (`/analyze-video`):**
   - The video is sent directly to Google's **Gemini 1.5 Flash** API via the `google-genai` SDK. Gemini is instructed to focus strictly on visual elements, returning a structured JSON containing scores for eye contact, body language, facial expressions, and framing.
   - Concurrently, the audio track is extracted from the video locally using `moviepy`.
   - The extracted audio is then passed to the core audio pipeline.

### Phase B: Audio Extraction & Transcription
3. **Acoustic Feature Extraction:** The audio file is analyzed using local, open-source models:
   - **Silero VAD** detects voice activity and segments the audio.
   - **Librosa** measures pitch variance, volume, and speech rate.
   - **OpenSMILE** (optional) extracts deeper emotional characteristics.
4. **Speech-to-Text:** The audio is transcribed using **Faster-Whisper** to generate a highly accurate text transcript with word-level timestamps.

### Phase C: Retrieval-Augmented Generation (RAG)
5. **Knowledge Base Query:** The system maintains a ChromaDB vector store filled with expert communication knowledge (`backend/rag/documents/`).
6. **Context Retrieval:** Before the agents analyze the user's speech, the system queries the vector store (e.g., searching for "high pitch variance and fast speech rate"). The retrieved expert context is injected into the agents' prompts to ground their analysis in established communication theory.

### Phase D: Multi-Agent Evaluation
7. **Agent Orchestration:** The transcribed text and acoustic features (and visual metrics, if available) are sent to three distinct AI agents running on **NVIDIA NIM (Llama 3)**:
   - **Communication Agent:** Evaluates vocabulary, sentence structure, and clarity.
   - **Confidence Agent:** Analyzes pitch variance, pauses, and speech rate to determine emotional state.
   - **Personality Agent:** Infers interaction style and professional presence.

### Phase E: Guardrails and Synthesis
8. **JSON Validation:** Each agent is instructed to return strict JSON. If configured, **Guardrails AI** validates the output to ensure no malformed data crashes the frontend.
9. **Final Report Generation:** The results from all three agents (and the Gemini visual analysis) are compiled. A final LLM pass generates a cohesive, personalized markdown report.
10. **Delivery:** The structured JSON, containing metrics, agent findings, and the final report, is sent back to the frontend to be visualized in an interactive dashboard.
