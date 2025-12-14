# backend/pipeline.py

from speech_to_text import transcribe_audio
from speech_features import analyze_speech
from agent import run_agents
from rag.rag_pipeline import rag_enhanced_report

def run_pipeline(audio_file: str):
    # STEP 3: Speech-to-text
    data = transcribe_audio(audio_file)

    # STEP 4: Feature extraction
    results, score, label, wpm, avg_pause = analyze_speech(
        audio_file,
        data["word_segments"]
    )

    pipeline_state = {
        "transcript": data["transcript"],
        "audio_features": {
            "speech_rate": results.get("speech_rate", round(wpm)),
            "pitch_variance": results.get("Pitch Variance"),
            "pause_ratio": results.get("pause_ratio"),
            "energy_level": results.get("energy_level"),
        }
    }

    # STEP 4: Agents
    agent_results = run_agents(pipeline_state)

    # STEP 5: Final report (RAG + LLM)
    final_report = rag_enhanced_report(agent_results)

    return {
        "transcript": data["transcript"],
        "speech_metrics": results,
        "confidence_score": score,
        "confidence_label": label,
        "agent_results": agent_results,
        "final_report": final_report
    }
