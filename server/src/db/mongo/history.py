from typing import Optional, List

from pydantic import Field, ConfigDict, BaseModel

from . import MongoBase, PyObjectId


class HistoryModel(MongoBase):
    user_id: Optional[PyObjectId] = Field(alias="userId", default=None)
    report_title: str = Field(...)
    created_at: Optional[str] = Field(alias="0000-00-00", default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "report_title": "Sample Report",
                "created_at": "0000-00-00"
            }
        }
    )


class UpdateReportModel(BaseModel):
    user_id: PyObjectId = None
    report_title: str = None
    created_at: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "report_title": "Sample Report",
                "created_at": "0000-00-00"
            }
        }
    )


class HistoryCollection(MongoBase):
    histories: List[HistoryModel]