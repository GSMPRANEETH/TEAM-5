# backend/api.py

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
from link import run_pipeline

app = FastAPI(title="Speech Personality Analysis API")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
import os
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{file_id}.wav"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = run_pipeline(file_path)
    return result
