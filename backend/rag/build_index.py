import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

DOC_PATH = "rag/documents"
INDEX_PATH = "rag/faiss_index"

def build_index():
    docs = []

    for file in os.listdir(DOC_PATH):
        if file.endswith(".md"):
            loader = TextLoader(os.path.join(DOC_PATH, file))
            docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(INDEX_PATH)

    print("✅ RAG index built successfully")

if __name__ == "__main__":
    build_index()
