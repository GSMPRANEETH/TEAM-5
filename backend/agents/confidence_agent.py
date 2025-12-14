from llm_helper import llm
from llm1.prompt_templates import CONFIDENCE_PROMPT
from utils.parser import safe_parse
from utils.feature_scoring import confidence_score

try:
    from rag.retriever import get_retriever
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

try:
    from guardrails_config import validate_agent_response
except ImportError:
    def validate_agent_response(x, _): return x


def _get_confidence_context(state):
    if not RAG_AVAILABLE:
        return ""
    try:
        retriever = get_retriever()
        return retriever.get_context_for_analysis("confidence", state.get("audio_features", {}))
    except Exception:
        return ""


def confidence_agent(state):
    f = state.get("audio_features", {})
    score = confidence_score(f)
    rag_context = _get_confidence_context(state)

    prompt = CONFIDENCE_PROMPT.format(
        rag_context=f"EXPERT KNOWLEDGE:\n{rag_context}\n" if rag_context else "",
        pitch_variance=f.get("pitch_variance"),
        energy_level=f.get("energy_level"),
        pause_ratio=f.get("pause_ratio"),
        confidence_score=score
    )

    response = llm.invoke(prompt)
    parsed = safe_parse(response)
    validated = validate_agent_response(parsed, "confidence_agent")

    return {"confidence_emotion_analysis": validated}
