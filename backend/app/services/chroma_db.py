import os

from langchain.document_loaders import CSVLoader
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import Chroma

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE_PATH = os.path.join(BASE_DIR, "../data/faq_cat_for_embed.csv")
DB_PATH = os.path.join(BASE_DIR, "../data/chroma_db")  # chromadb path


def load_fixed_csv_to_chroma():
    loader = CSVLoader(file_path=CSV_FILE_PATH)
    documents = loader.load()
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

    vector_store = Chroma.from_documents(
        documents, embedding_function, persist_directory=DB_PATH
    )
    vector_store.persist()

    return vector_store


def query_chroma(query: str):
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = Chroma(
        persist_directory=DB_PATH, embedding_function=embedding_function
    )

    retriever = vector_store.as_retriever()
    results = retriever.get_relevant_documents(query)
    return results
