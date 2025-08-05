from pydantic import BaseModel
from typing import Optional, List, TypeVar, Generic


T = TypeVar("T")


class Response(BaseModel, Generic[T]):
    page: int
    limit: int
    total: int
    profiles: List[T]


class Profile(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    command: str


class Cron(BaseModel):
    minute: Optional[int | str] = "*"
    hour: Optional[int | str] = "*"


class Schedule(BaseModel):
    id: Optional[int] = None
    name: str
    target: str
    command: str
    hour: str
    minute: str
