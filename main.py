"""
Speech Analysis Pipeline - Main Entry Point
Runs the complete workflow: Record → Preprocess → Transcribe → Analyze → AI Report
"""

import sounddevice as sd
import soundfile as sf
import json
import librosa
from rag.rag_pipeline import rag_enhanced_report
from speech_to_text import transcribe_audio
from speech_features import analyze_speech
from agent import run_agents

# 🔹 STEP-5 IMPORT
from llm1.report_generator import generate_final_report

# Configuration
DURATION = 45        # Recording duration in seconds
SAMPLE_RATE = 16000  # Required for Whisper
CHANNELS = 1

RAW_AUDIO = "raw_audio.wav"
CLEAN_AUDIO = "clean_audio.wav"


def record_audio(duration=DURATION, sample_rate=SAMPLE_RATE, channels=CHANNELS):
    """Record audio from microphone"""
    print("\n" + "="*50)
    print("🎙  STEP 1: RECORDING AUDIO")
    print("="*50)
    print(f"Recording for {duration} seconds... Speak now!\n")

    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=channels,
        dtype="float32"
    )

    sd.wait()

    sf.write(RAW_AUDIO, audio, sample_rate)
    print(f"✅ Recording saved as {RAW_AUDIO}\n")


def preprocess_audio(input_path=RAW_AUDIO, output_path=CLEAN_AUDIO):
    """Clean and normalize the recorded audio"""
    print("\n" + "="*50)
    print("🔧 STEP 2: PREPROCESSING AUDIO")
    print("="*50)

    y, sr = librosa.load(input_path, sr=16000, mono=True)

    y = librosa.util.normalize(y)
    y_trimmed, _ = librosa.effects.trim(y, top_db=20)

    sf.write(output_path, y_trimmed, sr)

    duration = librosa.get_duration(y=y_trimmed, sr=sr)

    print("✅ Audio preprocessing complete")
    print(f"   Duration: {duration:.2f} seconds")
    print(f"   Sample Rate: {sr} Hz\n")


def run_pipeline(audio_file=CLEAN_AUDIO):
    """Run speech-to-text, analysis, agents, and final AI report"""

    print("\n" + "="*50)
    print("🔄 STEP 3: SPEECH-TO-TEXT TRANSCRIPTION")
    print("="*50)

    data = transcribe_audio(audio_file)

    print("\n📝 Transcript:\n")
    print(data["transcript"])

    print("\n" + "="*50)
    print("📊 STEP 4: SPEECH ANALYSIS")
    print("="*50 + "\n")

    results, score, label, wpm, avg_pause = analyze_speech(
        audio_file,
        data["word_segments"]
    )

    print("===== SPEECH ANALYSIS REPORT =====\n")
    for k, v in results.items():
        print(f"  {k}: {v}")

    print(f"\n  Words Per Minute: {wpm}")
    print(f"  Average Pause: {avg_pause} sec")
    print(f"  Overall Score: {score}")
    print(f"  Confidence Level: {label}")

    # 🔹 Prepare agent input
    pipeline_state = {
        "transcript": data["transcript"],
        "audio_features": {
            "speech_rate": results.get("speech_rate", round(wpm)),
            "pitch_variance": results.get("pitch_variance"),
            "pause_ratio": results.get(
                "pause_ratio",
                round(avg_pause / (wpm / 60) if wpm else 0, 2)
            ),
            "energy_level": results.get("energy_level")
        }
    }

    print("\n🧠 STEP 4: RUNNING AGENTS\n")
    agent_results = run_agents(pipeline_state)

    print("\n📌 Communication Analysis")
    print(json.dumps(agent_results.get("communication_analysis"), indent=2))

    print("\n📌 Confidence & Emotion Analysis")
    print(json.dumps(agent_results.get("confidence_emotion_analysis"), indent=2))

    print("\n📌 Personality Mapping")
    print(json.dumps(agent_results.get("personality_analysis"), indent=2))

    # ==================================================
    # 🔥 STEP 5: LLM-BASED FINAL AI REPORT
    # ==================================================
    print("\n" + "="*50)
    print("✨ STEP 5: FINAL AI PERSONALITY REPORT")
    print("="*50 + "\n")

    #final_report = generate_final_report(agent_results)
    final_report = rag_enhanced_report(agent_results)

    print(final_report)

    print("\n" + "="*50)
    print("✅ PIPELINE COMPLETE!")
    print("="*50 + "\n")

    return pipeline_state


if __name__ == "__main__":
    print("\n" + "="*50)
    print("🎯 SPEECH ANALYSIS PIPELINE")
    print("="*50)

    try:
        record_audio()
        preprocess_audio()
        run_pipeline()

    except KeyboardInterrupt:
        print("\n\n⚠️  Pipeline interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        raise
