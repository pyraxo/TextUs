import os
import re

import pandas as pd
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.messages import SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import NLTKTextSplitter

from app.core.config import get_settings

settings = get_settings()

BASE_DIR = "./data"
CSV_FILE_PATH = os.path.join(BASE_DIR, "faq_cat_for_embed.csv")
DB_PATH = os.path.join(BASE_DIR, "chroma_db")

os.environ["GOOGLE_API_KEY"] = settings.google_api_key

chat_model = ChatGoogleGenerativeAI(model="models/gemini-1.5-pro-latest")
embedding_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001")


def preprocess_text(text):
    text = re.sub(r"Q:.*?\n", "", text, flags=re.DOTALL)
    text = re.sub(r"Categories:.*?\n", "", text, flags=re.DOTALL)
    return re.sub(r"\s+", " ", text).strip()


def load_fixed_csv_to_chroma():
    df = pd.read_csv(CSV_FILE_PATH, encoding="latin1")
    documents = []
    for _, row in df.iterrows():
        if answer := row.get("answer_md", ""):
            cleaned = preprocess_text(answer)
            documents.append(
                Document(
                    page_content=cleaned,
                    metadata={
                        "question": row.get("question", ""),
                        "category": row.get("category", ""),
                        "id": str(row.get("id", "")),
                    },
                )
            )
    splitter = NLTKTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_documents(documents)
    Chroma.from_documents(
        documents=chunks, embedding=embedding_model, persist_directory=DB_PATH
    )


chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(content="You are an FAQ assistant..."),
        HumanMessagePromptTemplate.from_template("""
Use the context below to directly and concisely answer the user's question.
Context: {context}
Question: {question}
Answer:"""),
    ]
)
output_parser = StrOutputParser()


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


rag_chain = (
    {
        "context": lambda q: format_docs(
            Chroma(persist_directory=DB_PATH, embedding_function=embedding_model)
            .as_retriever(search_type="mmr", search_kwargs={"k": 5})
            .invoke(q)
        ),
        "question": RunnablePassthrough(),
    }
    | chat_template
    | chat_model
    | output_parser
)


def answer_query(query: str) -> str:
    if not os.path.exists(DB_PATH):
        load_fixed_csv_to_chroma()
    return rag_chain.invoke(query)
