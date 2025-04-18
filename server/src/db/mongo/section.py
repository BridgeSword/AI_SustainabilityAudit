from typing import Optional, List

from pydantic import BaseModel, Field, EmailStr, ConfigDict

from . import MongoBase


class SectionModel(MongoBase):
    name: str = Field(...)
    initial_summary: str = Field(...)
    description: str = Field(..., default=None)
    agent_output: Optional[List] = Field(..., default=None, alias="agentOutput")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": "Section Name",
                "initial_summary": "Section Initial Summary"
            }
        }
    )


class UpdateSectionModel(BaseModel):
    name: Optional[str] = None
    initial_summary: Optional[str] = None
    description: Optional[str] = None
    agent_output: Optional[List] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": "Section Name",
                "initial_summary": "Section Initial Summary"
            }
        }
    )


class SectionCollection(MongoBase):
    sections: List[SectionModel]
