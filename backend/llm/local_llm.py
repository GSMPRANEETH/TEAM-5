"""LLM wrapper used by agents.

This module tries to use the `ChatNVIDIA` client if available, otherwise
falls back to a lightweight stub that returns deterministic JSON for
testing purposes.
"""
import json

from llm1.llm_config import LLM_MODEL_NAME, TEMPERATURE, MAX_TOKENS


class _StubLLM:
    """Fallback LLM that returns deterministic JSON for testing when NVIDIA API is unavailable."""
    
    def invoke(self, prompt: str) -> str:
        p = prompt.lower() if prompt else ""
        if "communication analysis ai agent" in p:
            resp = {
                "clarity_score": 85,
                "fluency_level": "Good",
                "speech_structure": "Structured",
                "vocabulary_level": "Advanced"
            }
        elif "confidence & emotion analysis ai agent" in p or "confidence & emotion" in p:
            resp = {"confidence_level": "High", "nervousness": "Low", "emotion": "Calm"}
        elif "personality mapping ai agent" in p or "personality" in p:
            resp = {"personality_type": "Balanced", "assertiveness": "Moderate", "expressiveness": "Moderate"}
        elif "communication coach" in p or "personality report" in p:
            # Final report stub
            return """
📊 **Communication Overview**
- Clarity Score: 85/100 (Good)
- Fluency: Good with structured delivery
- Vocabulary: Advanced level

💪 **Confidence & Emotional Tone**
- Confidence Level: High
- Nervousness: Low
- Emotional State: Calm and composed

🧠 **Personality Insights**
- Type: Balanced communicator
- Assertiveness: Moderate
- Expressiveness: Moderate

⭐ **Key Strengths**
• Clear and structured communication
• Confident delivery with controlled emotions
• Professional and balanced approach

🎯 **Improvement Recommendations**
• Continue practicing for even more natural flow
• Consider adding more vocal variety for engagement
• Maintain current confident pace

*Note: This is a stub response - NVIDIA API is not running.*
"""
        else:
            resp = {"message": "stub response", "note": "NVIDIA API not running - using fallback"}
        return json.dumps(resp)


class _LazyNvidiaLLM:
    """Lazy-loading wrapper that tries NVIDIA API first, falls back to stub."""
    
    def __init__(self):
        self._llm = None
        self._initialized = False
    
    def _get_llm(self):
        if not self._initialized:
            self._initialized = True
            try:
                from langchain_nvidia_ai_endpoints import ChatNVIDIA
                from langchain_core.output_parsers import StrOutputParser

                chat_model = ChatNVIDIA(
                    model=LLM_MODEL_NAME,
                    temperature=TEMPERATURE,
                    max_tokens=MAX_TOKENS
                )
                self._llm = chat_model | StrOutputParser()
                
                # Test connection
                self._llm.invoke("test")
            except Exception as e:
                print(f"⚠️ NVIDIA API not available ({e}), using stub LLM")
                self._llm = _StubLLM()
        return self._llm
    
    def invoke(self, prompt: str) -> str:
        return self._get_llm().invoke(prompt)


# Export lazy-loading LLM instance
llm = _LazyNvidiaLLM()