def normalize(value, min_val, max_val):
    try:
        return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))
    except Exception:
        return 0.0


def communication_score(features):
    speech_rate = normalize(features.get("speech_rate", 120), 80, 180)
    pause_ratio = normalize(features.get("pause_ratio", 0.2), 0.05, 0.4)

    w_speech = 0.6
    w_pause = 0.4
    bias = 0.1

    score = (w_speech * speech_rate) + (w_pause * (1 - pause_ratio)) + bias
    return round(score * 100, 2)


def confidence_score(features):
    pitch_var = normalize(features.get("pitch_variance", 20), 5, 40)
    energy_map = {
        "low": 0.3,
        "medium": 0.6,
        "medium-high": 0.8,
        "high": 1.0
    }
    energy = energy_map.get(features.get("energy_level", "medium"), 0.6)
    pause_ratio = normalize(features.get("pause_ratio", 0.2), 0.05, 0.4)

    w_pitch = 0.4
    w_energy = 0.4
    w_pause = 0.2
    bias = 0.1

    score = (w_pitch * pitch_var) + (w_energy * energy) + (w_pause * (1 - pause_ratio)) + bias
    return round(score * 100, 2)
