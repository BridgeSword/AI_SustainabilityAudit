from typing import Optional, List
from dataclasses import dataclass, field

from pydantic import BaseModel, Field, field_validator


class CarbonReportPlanRequest(BaseModel):
    standard: str
    goal: str
    plan: str
    action: str
    company: str
    genai_model: str
    device: str = Field(default="cpu", validate_default=True)

    @field_validator('device', mode='before')
    @classmethod
    def ensure_device(cls, device: Optional[str]) -> str:
        return device or "cpu"
    
@dataclass
class CRPlan:
    standard: str = field(default_factory=str)
    goal: str = field(default_factory=str)
    plan: str = field(default_factory=str)
    action: str = field(default_factory=str)
    company: str = field(default_factory=str)
    genai_model: str = field(default_factory=str)
    device: str = field(default_factory=str)
    
class CarbonReportPlanResponse(BaseModel):
    task_status: str = Field(default=None)
    task_id: str = Field(default=None)
    error: str = Field(default=None)


class CarbonReportGenRequest(BaseModel):
    user_approved: bool


class CarbonReportGenResponse(BaseModel):
    report_path: str = Field(default=None)
    report_status: str = Field(default=None)


class ComputeDocumentEmbeddingsRequest(BaseModel):
    docs_path: str
    embedding_model: str
    device: str = Field(default="cpu", validate_default=True)
    chunk_size: int = Field(default=256, validate_default=True)

    @field_validator('chunk_size', mode='before')
    @classmethod
    def ensure_id(cls, chunk_size: Optional[int]) -> int:
        return chunk_size or 256
    
    @field_validator('device', mode='before')
    @classmethod
    def ensure_device(cls, device: Optional[str]) -> str:
        return device or "cpu"
    

class GetEmbeddingRequest(BaseModel):
    texts: List[str]
    model: str
    device: str = Field(default="cpu", validate_default=True)

    @field_validator('device', mode='before')
    @classmethod
    def ensure_device(cls, device: Optional[str]) -> str:
        return device or "cpu"


class SearchEmbRequest(BaseModel):
    query: str
    model: str
    k: int = Field(default=3, validate_default=True)
    device: str = Field(default="cpu", validate_default=True)

    @field_validator('k', mode='before')
    @classmethod
    def ensure_k(cls, device: Optional[int]) -> int:
        return device or 3
    
    @field_validator('device', mode='before')
    @classmethod
    def ensure_device(cls, device: Optional[str]) -> str:
        return device or "cpu"
