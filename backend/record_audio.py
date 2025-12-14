# backend/record_audio.py

import shutil
import subprocess
from fastapi import UploadFile

RAW_AUDIO = "raw_audio.wav"
TEMP_AUDIO = "temp_audio.webm"
SAMPLE_RATE = 16000

def record_audio(file: UploadFile):
    print("🎙 Receiving audio from frontend...")

    # Save raw uploaded file
    with open(TEMP_AUDIO, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Convert to WAV using ffmpeg
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", TEMP_AUDIO,
            "-ac", "1",
            "-ar", str(SAMPLE_RATE),
            RAW_AUDIO
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )

    print("✅ Recording saved as raw_audio.wav")

    return RAW_AUDIO
