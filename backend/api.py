# backend/api.py
"""FastAPI application for speech analysis with comprehensive input validation."""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
import os
import logging
from typing import Dict, Any
import uuid
import shutil

from validators.file_validator import validate_audio_file
from record_audio import record_audio
from link import run_pipeline
from video_pipeline import run_video_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Speech Personality Analysis API",
    description="AI-powered speech analysis with personality insights",
    version="1.0.0"
)

# Configure CORS - fail closed by default, only allow wildcard in development
# Example: ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
# Or: ENV="development" for wildcard access
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
if raw_origins:
    # Split, trim, and filter blank entries
    ALLOWED_ORIGINS = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
elif os.getenv("ENV") == "development" or os.getenv("DEBUG") == "true":
    # Only allow wildcard in explicit development mode
    ALLOWED_ORIGINS = ["*"]
    logger.warning("CORS configured with wildcard '*' in development mode")
else:
    # Fail closed in production
    ALLOWED_ORIGINS = []
    logger.info("CORS configured with no allowed origins (production default)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Maximum video file size: 100MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024

# Video file magic bytes for common formats
VIDEO_SIGNATURES = {
    b'\x00\x00\x00\x18ftypmp42': 'mp4',
    b'\x00\x00\x00\x1Cftypisom': 'mp4',
    b'\x00\x00\x00\x20ftypisom': 'mp4',
    b'\x1a\x45\xdf\xa3': 'webm',
    b'\x00\x00\x00\x14ftypqt': 'mov',
    b'RIFF': 'avi',
}

async def validate_video_file(file: UploadFile) -> None:
    """
    Validate video file by checking MIME type, file signature, and size.

    Args:
        file: The uploaded video file

    Raises:
        HTTPException: If validation fails
    """
    # Check MIME type
    if not file.content_type or not file.content_type.startswith('video/'):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type: {file.content_type}. Expected video/* MIME type."
        )

    # Read file header to check magic bytes
    header = await file.read(32)
    if len(header) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Check file signature
    valid_signature = False
    for signature in VIDEO_SIGNATURES.keys():
        if header.startswith(signature):
            valid_signature = True
            break

    if not valid_signature:
        await file.seek(0)
        raise HTTPException(
            status_code=400,
            detail="Invalid video file format. File header does not match expected video signatures."
        )

    # Check file size by reading in chunks
    await file.seek(0)
    total_size = len(header)
    chunk_size = 8192

    while total_size < MAX_VIDEO_SIZE:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_size += len(chunk)

    if total_size >= MAX_VIDEO_SIZE:
        await file.seek(0)
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {MAX_VIDEO_SIZE // (1024 * 1024)}MB."
        )

    # Reset file pointer to beginning
    await file.seek(0)


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

    # Initialize temp file paths before try/except
    audio_path = None
    webm_path = None
    try:
        # Record/save the audio file - returns (wav_path, webm_path)
        audio_path, webm_path = await run_in_threadpool(record_audio, file)
        logger.info(f"Processing audio file: {file.filename}")

        # Run the analysis pipeline with the WAV path
        result = await run_in_threadpool(run_pipeline, audio_path)

        logger.info(f"Analysis completed successfully for: {file.filename}")
        return result

    except HTTPException:
        # Re-raise HTTP exceptions (from validation)
        raise
    except Exception as e:
        logger.exception(f"Error processing audio file {file.filename}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error processing audio file"
        )
    finally:
        # Cleanup: Remove all temporary audio files (both WAV and WebM)
        for temp_file in [audio_path, webm_path]:
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                    logger.debug(f"Cleaned up temporary file: {temp_file}")
                except Exception as e:
                    logger.warning(f"Failed to cleanup file {temp_file}: {e}")

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Analyze uploaded video file for visual cues and extract audio for standard analysis.

    Args:
        file: Video file upload (MP4, WebM, etc.)

    Returns:
        Dictionary containing analysis results including transcript,
        speech metrics, visual metrics, agent analyses, and final report
    """
    # Validate the uploaded video file
    await validate_video_file(file)

    # Generate unique filename to prevent collisions
    ext = os.path.splitext(file.filename or "video.mp4")[1]
    unique_id = uuid.uuid4()
    video_path = os.path.join(UPLOAD_DIR, f"temp_video_{unique_id}{ext}")

    try:
        # Save the uploaded video to disk with streaming copy
        def save_upload_file(upload_file: UploadFile, destination: str) -> None:
            with open(destination, "wb") as f:
                shutil.copyfileobj(upload_file.file, f)

        await run_in_threadpool(save_upload_file, file, video_path)

        logger.info(f"Processing video file: {file.filename}")

        # Run the video analysis pipeline
        result = await run_video_pipeline(video_path)

        logger.info(f"Video analysis completed successfully for: {file.filename}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error processing video file {file.filename}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error processing video file"
        )
    finally:
        # Cleanup: Remove the temporary video file
        if video_path and os.path.exists(video_path):
            try:
                os.remove(video_path)
                logger.debug(f"Cleaned up temporary video file: {video_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup video file {video_path}: {e}")
