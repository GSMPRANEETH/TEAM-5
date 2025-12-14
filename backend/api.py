# backend/api.py

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from record_audio import record_audio
from link import run_pipeline

app = FastAPI(title="Speech Personality Analysis API")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    audio_path = record_audio(file)
    result = run_pipeline(audio_path)
    return result

