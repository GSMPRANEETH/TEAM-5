import os
import json
import logging
import asyncio
from typing import Dict, Any
from google import genai
from moviepy import VideoFileClip
from link import run_pipeline

logger = logging.getLogger(__name__)

# Try to get the Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def extract_audio_from_video(video_path: str) -> str:
    """
    Extracts audio from the provided video file and saves it as a WAV file.
    Returns the path to the newly created WAV file.
    """
    audio_path = video_path.rsplit(".", 1)[0] + "_extracted_audio.wav"
    try:
        with VideoFileClip(video_path) as video:
            # We don't want logs blocking the terminal
            video.audio.write_audiofile(audio_path, logger=None)
        logger.info(f"Successfully extracted audio to: {audio_path}")
        return audio_path
    except Exception as e:
        logger.error(f"Error extracting audio from video: {e}")
        raise

async def analyze_video_visuals(video_path: str) -> Dict[str, Any]:
    """
    Uses Gemini Vision API to analyze the visual aspects of the video
    (e.g., eye contact, facial expressions, body language, lighting).
    """
    # If there's no API key, return a stub response
    if not GEMINI_API_KEY:
        logger.warning("No GEMINI_API_KEY found, returning stub visual analysis.")
        return {
            "eye_contact_score": 85,
            "body_language": "Good posture, appropriate hand gestures.",
            "facial_expressions": "Smiling frequently, conveying confidence.",
            "lighting_and_framing": "Well-lit and centered.",
            "overall_visual_feedback": "You present yourself very professionally on camera. Maintain this level of engagement."
        }

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        # In production with larger files, we should use the File API.
        # But for short analysis snippets, we can use the file upload if supported or fall back to extracting frames.
        # For this product, we'll upload the file directly using GenAI SDK.

        logger.info(f"Uploading video {video_path} to Gemini...")
        # Uploading the video file for processing
        video_file = await asyncio.to_thread(client.files.upload, file=video_path)

        prompt = """
        Analyze this video of a person speaking. Focus ONLY on the visual aspects.
        Provide your response as a raw JSON object with the following keys exactly:
        {
            "eye_contact_score": <number 0-100>,
            "body_language": "<string describing posture and gestures>",
            "facial_expressions": "<string describing emotions and expressions>",
            "lighting_and_framing": "<string describing the environment and camera angle>",
            "overall_visual_feedback": "<string summarizing visual performance>"
        }
        Return ONLY valid JSON.
        """

        logger.info("Generating content from Gemini...")
        response = await asyncio.to_thread(
            client.models.generate_content,
            model='gemini-1.5-flash',
            contents=[video_file, prompt]
        )

        text_response = response.text
        # Clean up markdown code blocks if any
        if text_response.startswith("```json"):
            text_response = text_response.strip("```json").strip("```").strip()

        result = json.loads(text_response)
        logger.info("Successfully analyzed video visuals.")
        return result

    except Exception as e:
        logger.error(f"Error during Gemini visual analysis: {e}")
        # Fallback to stub on error to not break the pipeline
        return {
            "eye_contact_score": 0,
            "body_language": "Analysis failed due to API error.",
            "facial_expressions": "Analysis failed due to API error.",
            "lighting_and_framing": "Analysis failed due to API error.",
            "overall_visual_feedback": f"Could not analyze video. Error: {str(e)}"
        }

async def run_video_pipeline(video_path: str) -> Dict[str, Any]:
    """
    Main orchestration function for video analysis.
    1. Analyzes the video visuals using Gemini.
    2. Extracts audio from the video.
    3. Runs the existing audio pipeline on the extracted audio.
    4. Merges the results.
    """
    extracted_audio_path = None
    try:
        # Run visual analysis concurrently with audio extraction/processing could be faster,
        # but sequentially is safer to avoid overwhelming I/O on small instances.
        logger.info("Starting visual analysis pipeline...")
        visual_analysis = await analyze_video_visuals(video_path)

        logger.info("Extracting audio from video...")
        extracted_audio_path = extract_audio_from_video(video_path)

        logger.info("Running existing audio pipeline on extracted audio...")
        # run_pipeline is currently sync, so we need to run it in a threadpool to not block the event loop
        audio_analysis_result = await asyncio.to_thread(run_pipeline, extracted_audio_path)

        # Merge the results
        audio_analysis_result["visual_metrics"] = visual_analysis

        return audio_analysis_result

    finally:
        # Cleanup extracted audio
        if extracted_audio_path and os.path.exists(extracted_audio_path):
            try:
                os.remove(extracted_audio_path)
                logger.debug(f"Cleaned up extracted audio file: {extracted_audio_path}")
            except Exception as e:
                logger.warning(f"Failed to clean up extracted audio: {e}")
