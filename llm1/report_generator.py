# llm1/report_generator.py

from llm1.local_llm import get_llm


def generate_final_report(agent_outputs: dict):
    """
    Converts agent outputs into a user-friendly AI report
    """
    llm = get_llm()

    prompt = f"""
You are an AI communication coach.

Given the following structured analysis from multiple agents,
generate a clear, well-formatted personality report.

Agent Outputs:
{agent_outputs}

Rules:
- Use friendly language
- Highlight strengths
- Give improvement tips
- Do NOT diagnose
- Use bullet points and emojis
"""

    return llm.invoke(prompt)
