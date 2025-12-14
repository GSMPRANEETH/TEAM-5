# llm1/local_llm.py

import json
from llm1.llm_config import LLM_MODEL_NAME, TEMPERATURE, MAX_TOKENS


class _StubLLM:
    """Fallback LLM that returns deterministic JSON for testing when Ollama is unavailable."""
    
    def invoke(self, prompt: str) -> str:
        p = prompt.lower() if prompt else ""
        if "communication" in p:
            resp = {
                "clarity_score": 85,
                "fluency_level": "Good",
                "speech_structure": "Structured",
                "vocabulary_level": "Advanced"
            }
        elif "confidence" in p:
            resp = {"confidence_level": "High", "nervousness": "Low", "emotion": "Calm"}
        elif "personality" in p:
            resp = {"personality_type": "Balanced", "assertiveness": "Moderate", "expressiveness": "Moderate"}
        elif "communication coach" in p or "personality report" in p:
            return """
📊 **Communication Overview**
- Clarity Score: 85/100 (Good)
- Fluency: Good with structured delivery

💪 **Confidence & Emotional Tone**
- Confidence Level: High
- Nervousness: Low

🧠 **Personality Insights**
- Type: Balanced communicator
- Assertiveness: Moderate

⭐ **Key Strengths**
• Clear and structured communication
• Confident delivery

🎯 **Improvement Recommendations**
• Continue practicing for natural flow
• Maintain current confident pace

*Note: Ollama server is not running - using stub response.*
"""
        else:
            resp = {"message": "stub response", "note": "Ollama not running"}
        return json.dumps(resp)


def get_llm():
    """
    Returns a free local LLM instance using Ollama.
    Falls back to stub if Ollama is not available.
    """
    try:
        # Try new langchain-ollama package first
        try:
            from langchain_ollama import OllamaLLM
            llm = OllamaLLM(
                model=LLM_MODEL_NAME,
                temperature=TEMPERATURE,
                num_predict=MAX_TOKENS
            )
        except ImportError:
            from langchain_community.llms import Ollama
            llm = Ollama(
                model=LLM_MODEL_NAME,
                temperature=TEMPERATURE,
                num_predict=MAX_TOKENS
            )
        
        # Quick test to see if Ollama is running
        llm.invoke("hi")
        return llm
        
    except Exception as e:
        print(f"⚠️ Ollama not available: {e}")
        print("   Using stub LLM for testing...")
        return _StubLLM()


# Module-level LLM instance for compatibility with code expecting `llm` attribute
llm = get_llm()

