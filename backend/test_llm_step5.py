# test_llm_step5.py

from llm1.local_llm import get_llm

llm = get_llm()
print(llm.invoke("Give a short confidence evaluation"))
