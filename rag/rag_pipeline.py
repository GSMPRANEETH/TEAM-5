from rag.retriever import get_retriever
from llm1.local_llm import get_llm

def rag_enhanced_report(agent_outputs):
    retriever = get_retriever()
    llm = get_llm()

    query = f"""
    Given the following agent analysis, provide grounded insights:
    {agent_outputs}
    """

    docs = retriever.invoke(query)


    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are an AI communication coach.

Use ONLY the following knowledge to support your insights:
{context}

Agent Analysis:
{agent_outputs}

Rules:
- Base statements on retrieved knowledge
- Avoid speculation
- Use constructive tone
"""

    return llm.invoke(prompt)
