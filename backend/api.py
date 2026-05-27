# backend/api.py
"""FastAPI application for speech analysis with comprehensive input validation."""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
import os
import tempfile
import logging
from typing import Dict, Any

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
    version="1.0.0",
)

# Configure CORS - fail closed by default, only allow wildcard in development
# Example: ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
# Or: ENV="development" for wildcard access
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
if raw_origins:
    # Split, trim, and filter blank entries
    ALLOWED_ORIGINS = [
        origin.strip() for origin in raw_origins.split(",") if origin.strip()
    ]
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
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".avi"}
ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
}
MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024
VIDEO_UPLOAD_CHUNK_SIZE = 1024 * 1024


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
            status_code=500, detail="Internal server error processing audio file"
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
    filename = file.filename or ""
    extension = os.path.splitext(filename)[1].lower()
    if extension not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid video format. Please upload MP4, WebM, MOV, or AVI.",
        )
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid video content type. Please upload a valid video file.",
        )

    video_path = None

    try:
        total_bytes = 0
        with tempfile.NamedTemporaryFile(
            mode="wb",
            delete=False,
            dir=UPLOAD_DIR,
            prefix="temp_video_",
            suffix=extension,
        ) as temp_video:
            video_path = temp_video.name
            while chunk := await file.read(VIDEO_UPLOAD_CHUNK_SIZE):
                total_bytes += len(chunk)
                if total_bytes > MAX_VIDEO_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="Video file too large. Maximum size is 50MB.",
                    )
                temp_video.write(chunk)

        if total_bytes == 0:
            raise HTTPException(status_code=400, detail="Uploaded video file is empty.")

        logger.info(f"Processing video file: {filename}")

        # Run the video analysis pipeline
        result = await run_video_pipeline(video_path)

        logger.info(f"Video analysis completed successfully for: {filename}")
        return result

    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid video content for {filename}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"Error processing video file {filename}: {e}")
        raise HTTPException(
            status_code=500, detail="Internal server error processing video file"
        )
    finally:
        # Cleanup: Remove the temporary video file
        if video_path and os.path.exists(video_path):
            try:
                os.remove(video_path)
                logger.debug(f"Cleaned up temporary video file: {video_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup video file {video_path}: {e}")
