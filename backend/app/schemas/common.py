from typing import Optional, Generic, TypeVar, Any
from pydantic import BaseModel

DataType = TypeVar("DataType")

class ResponseModel(BaseModel, Generic[DataType]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[DataType] = None
    error: Optional[str] = None

