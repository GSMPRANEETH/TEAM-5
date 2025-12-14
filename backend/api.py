# backend/api.py
"""FastAPI application for speech analysis with comprehensive input validation."""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from typing import Dict, Any

from validators.file_validator import validate_audio_file, sanitize_filename
from record_audio import record_audio
from link import run_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Speech Personality Analysis API",
    description="AI-powered speech analysis with personality insights",
    version="1.0.0"
)

# Configure CORS - restrict origins in production via environment variables
# Example: ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "speech-analysis-api"}


@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Analyze uploaded audio file for speech patterns and personality insights.
    
    Args:
        file: Audio file upload (WAV, MP3, WebM, OGG)
        
    Returns:
        Dictionary containing analysis results including transcript,
        speech metrics, agent analyses, and final report
        
    Raises:
        HTTPException: If file validation fails or processing errors occur
    """
    # Validate the uploaded file
    await validate_audio_file(file)
    
    audio_path = None
    try:
        # Record/save the audio file
        audio_path = record_audio(file)
        logger.info(f"Processing audio file: {file.filename}")
        
        # Run the analysis pipeline
        result = run_pipeline(audio_path)
        
        logger.info(f"Analysis completed successfully for: {file.filename}")
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions (from validation)
        raise
    except Exception as e:
        logger.exception(f"Error processing audio file {file.filename}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio file: {str(e)}"
        )
    finally:
        # Cleanup: Remove temporary audio file
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                logger.debug(f"Cleaned up temporary file: {audio_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup file {audio_path}: {e}")

