# llm1/prompt_templates.py

COMMUNICATION_PROMPT = """
You are an expert communication evaluator.

Given the following speech transcript and metrics,
analyze clarity, fluency, and structure.

Transcript:
{transcript}

Metrics:
{metrics}

Return concise insights.
"""

CONFIDENCE_PROMPT = """
You are a psychology-based confidence analyzer.

Given the vocal features below, assess confidence and emotional tone.

Features:
{features}

Return confidence level and emotional state.
"""

PERSONALITY_PROMPT = """
You are a personality insight generator.

Based on communication and confidence analysis,
infer personality traits carefully.

Rules:
- Do NOT diagnose mental conditions
- Use constructive language
- Avoid absolute claims

Inputs:
{inputs}
"""
