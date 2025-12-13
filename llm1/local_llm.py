# llm1/local_llm.py

from langchain_community.llms import Ollama
from llm1.llm_config import LLM_MODEL_NAME, TEMPERATURE, MAX_TOKENS


def get_llm():
    """
    Returns a free local LLM instance using Ollama
    """
    return Ollama(
        model=LLM_MODEL_NAME,
        temperature=TEMPERATURE,
        num_predict=MAX_TOKENS
    )
