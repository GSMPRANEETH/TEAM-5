import librosa
import opensmile
import torch

# ---------------------------
# LOAD MODELS ONCE
# ---------------------------

# openSMILE feature extractor (standardized acoustic features)
try:
    smile = opensmile.Smile(
        feature_set=opensmile.FeatureSet.eGeMAPSv02,
        feature_level=opensmile.FeatureLevel.Functionals,
    )
except Exception as e:
    print(f"⚠️ Failed to initialize openSMILE: {e}")
    smile = None

# ---------------------------
# Silero VAD (Offline, Stable)
# ---------------------------
try:
    vad_model, vad_utils = torch.hub.load(
        repo_or_dir="snakers4/silero-vad",
        model="silero_vad",
        trust_repo=True
    )
except Exception as e:
    print(f"⚠️ Failed to load Silero VAD model: {e}")
    vad_model = None
    vad_utils = None

if vad_utils is not None:
    (
        get_speech_timestamps,
        save_audio,
        read_audio,
        VADIterator,
        collect_chunks
    ) = vad_utils
else:
    get_speech_timestamps = save_audio = read_audio = VADIterator = collect_chunks = None


def compute_pause_ratio(audio_path, sampling_rate=16000):
    """
    Computes pause ratio using Silero VAD
    pause_ratio = non-speech duration / total duration
    Returns (pause_ratio, pause_time) or (None, None) if VAD model unavailable
    """
    # If VAD model is not available, return unavailability indicators
    if vad_model is None or get_speech_timestamps is None:
        print("⚠️ Silero VAD model not available, returning unavailability indicators")
        return None, None

    wav = read_audio(audio_path, sampling_rate=sampling_rate)

    speech_timestamps = get_speech_timestamps(
        wav, vad_model, sampling_rate=sampling_rate
    )

    if not speech_timestamps:
        return 1.0, 0.0  # all pause

    speech_time = sum(
        (seg["end"] - seg["start"]) / sampling_rate
        for seg in speech_timestamps
    )

    total_duration = len(wav) / sampling_rate
    pause_time = max(total_duration - speech_time, 0)

    pause_ratio = pause_time / total_duration if total_duration > 0 else 0
    return round(pause_ratio, 2), round(pause_time, 2)


# ---------------------------
# MAIN FUNCTION
# ---------------------------
def analyze_speech(audio_file, word_segments):
    # Load audio
    y, sr = librosa.load(audio_file, sr=16000)
    duration_sec = librosa.get_duration(y=y, sr=sr)

    # -----------------------
    # Speech Rate (WPM)
    # -----------------------
    total_words = len(word_segments)
    wpm = round((total_words / duration_sec) * 60, 2) if duration_sec > 0 else 0

    # -----------------------
    # Pause Analysis (Silero VAD)
    # -----------------------
    pause_ratio, total_pause_time = compute_pause_ratio(audio_file)

    # -----------------------
    # Acoustic Features (openSMILE)
    # -----------------------
    if smile is None:
        print("⚠️ openSMILE model not available, setting acoustic features to unavailable")
        loudness = None
        pitch_mean = None
        pitch_variance = None
        jitter = None
        shimmer = None
    else:
        features = smile.process_file(audio_file)

        def get_feature(df, name_candidates, default=None):
            for name in name_candidates:
                if name in df.columns:
                    val = df[name].iloc[0]
                    return float(val) if val is not None else None
            return None

        loudness = get_feature(
            features,
            ["loudness_sma3_amean", "loudness_sma3_mean"]
        )

        pitch_mean = get_feature(
            features,
            ["F0semitoneFrom27.5Hz_sma3nz_amean"]
        )

        pitch_variance = get_feature(
            features,
            ["F0semitoneFrom27.5Hz_sma3nz_stddevNorm"]
        )

        jitter = get_feature(
            features,
            ["jitterLocal_sma3nz_amean"]
        )

        shimmer = get_feature(
            features,
            ["shimmerLocaldB_sma3nz_amean"]
        )

    # -----------------------
    # Energy Level Mapping
    # -----------------------
    if loudness is None:
        energy_level = None
    elif loudness >= 0.8:
        energy_level = "high"
    elif loudness >= 0.5:
        energy_level = "medium-high"
    elif loudness >= 0.3:
        energy_level = "medium"
    else:
        energy_level = "low"

    # -----------------------
    # Confidence Score
    # -----------------------
    # Calculate confidence score only if all required components are available
    if loudness is not None and pause_ratio is not None:
        confidence_score = round(
            (min(wpm, 160) / 160) * 40 +
            (loudness * 40) +
            ((1 - pause_ratio) * 20),
            2
        )
        label = (
            "High Confidence" if confidence_score >= 75 else
            "Moderate Confidence" if confidence_score >= 50 else
            "Low Confidence"
        )
    else:
        confidence_score = None
        label = "Analysis Degraded"

    # Determine if analysis is degraded
    analysis_degraded = (smile is None) or (vad_model is None) or (get_speech_timestamps is None)

    # -----------------------
    # RESULTS
    # -----------------------
    results = {
        "speech_rate": round(wpm),
        "pause_ratio": pause_ratio,
        "energy_level": energy_level,
        "Energy (Loudness)": loudness if loudness is None else round(loudness, 3),
        "Pitch Mean (semitones)": pitch_mean if pitch_mean is None else round(pitch_mean, 2),
        "Pitch Variance": pitch_variance if pitch_variance is None else round(pitch_variance, 3),
        "Jitter": jitter if jitter is None else round(jitter, 4),
        "Shimmer (dB)": shimmer if shimmer is None else round(shimmer, 4),
        "Speech Duration (sec)": round(duration_sec, 2),
        "Total Pause Time (sec)": total_pause_time,
        "Total Words": total_words,
        "_analysis_degraded": analysis_degraded
    }

    return results, confidence_score, label, wpm, total_pause_time
