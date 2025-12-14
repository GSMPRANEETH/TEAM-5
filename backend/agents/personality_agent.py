from llm_helper import llm
from llm1.prompt_templates import PERSONALITY_PROMPT
from utils.parser import safe_parse

try:
    from rag.retriever import get_retriever
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

try:
    from guardrails_config import validate_agent_response
except ImportError:
    def validate_agent_response(x, _): return x


def _get_personality_context(state):
    if not RAG_AVAILABLE:
        return ""
    try:
        retriever = get_retriever()
        return retriever.get_context_for_analysis("personality", state)
    except Exception:
        return ""


def personality_agent(state):
    comm = state.get("communication_analysis", {})
    conf = state.get("confidence_emotion_analysis", {})

    prompt = PERSONALITY_PROMPT.format(
        rag_context="",
        communication_analysis=comm,
        confidence_analysis=conf,
        communication_score=comm.get("communication_score"),
        confidence_score=conf.get("confidence_score")
    )

    response = llm.invoke(prompt)
    parsed = safe_parse(response)
    validated = validate_agent_response(parsed, "personality_agent")

    return {"personality_analysis": validated}
