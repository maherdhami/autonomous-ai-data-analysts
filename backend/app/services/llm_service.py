from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from app.core.config import settings


def get_llm(api_key: str):
    """Initializes LLM strictly using the user-provided API key."""
    if not api_key or not api_key.strip():
        raise ValueError("User API key is required. Please provide a valid Groq (gsk_...) or OpenAI (sk-...) API key.")

    key = api_key.strip()
    if key.startswith("sk-"):
        return ChatOpenAI(model="gpt-4o-mini", api_key=key)
    return ChatGroq(model=settings.DEFAULT_MODEL, api_key=key)


class LLMService:
    def __init__(self, api_key: str):
        self.llm = get_llm(api_key)

    def invoke(self, prompt, variables: dict) -> str:
        chain = prompt | self.llm
        res = chain.invoke(variables)
        return str(res.content) if hasattr(res, "content") else str(res)

    def invoke_chain_with_retry(self, prompt, variables: dict, max_retries: int = 2) -> str:
        return self.invoke(prompt, variables)
