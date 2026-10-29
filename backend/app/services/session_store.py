from typing import Dict, Any, Optional
import pandas as pd


class SessionStore:
    """
    Pure in-memory dataset store.
    Stores the active uploaded pandas DataFrame and metadata in memory.
    Zero database requirements, zero persistence, zero headers required.
    """
    def __init__(self):
        self._df: Optional[pd.DataFrame] = None
        self._metadata: Optional[dict] = None

    def set_dataset(self, df: pd.DataFrame, metadata: dict, session_id: Optional[str] = None):
        self._df = df
        self._metadata = metadata

    def clear_dataset(self, session_id: Optional[str] = None):
        self._df = None
        self._metadata = None

    def get_dataframe(self, session_id: Optional[str] = None) -> Optional[pd.DataFrame]:
        return self._df

    def get_metadata(self, session_id: Optional[str] = None) -> Optional[dict]:
        return self._metadata


session_store = SessionStore()
