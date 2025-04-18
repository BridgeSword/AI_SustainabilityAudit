import os
from bson.objectid import ObjectId
from pydantic import BeforeValidator

from motor import motor_asyncio
from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from typing import Annotated, Optional


PyObjectId = Annotated[str, BeforeValidator(str)]


load_dotenv()

MONGO_URL = f"mongodb://{os.getenv('MONGO_ROOT_USER')}:{os.getenv('MONGO_ROOT_PASS')}@{os.getenv('MONGO_HOST')}:{os.getenv('MONGO_PORT')}/{os.getenv('MONGO_CORE_DB')}?retryWrites=true&w=majority"

mongo_client = motor_asyncio.AsyncIOMotorClient(MONGO_URL)
core_db = mongo_client.get_database(os.getenv('MONGO_SMARAG_DB'))

class MongoBase(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

class StudentModel(MongoBase):
    """
    Container for a single student record.
    """

    # The primary key for the StudentModel, stored as a `str` on the instance.
    # This will be aliased to `_id` when sent to MongoDB,
    # but provided as `id` in the API requests and responses.
    # id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(..., alias="naMEsUpdate")
    # email: EmailStr = Field(...)
    # course: str = Field(...)
    # gpa: float = Field(..., le=4.0)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": "Jane Doe",
                # "email": "jdoe@example.com",
                # "course": "Experiments, Science, and Fashion in Nanophotonics",
                # "gpa": 3.0,
            }
        },
    )

async def get_mongo_client():
    collection_names = await core_db.list_collection_names()
    print(f"Collection names: {collection_names}")

    student_collection = core_db.get_collection("tests")

    student = StudentModel(name="praneet")
    new_student = await student_collection.insert_one(
        student.model_dump(by_alias=True, exclude=["id"])
    )
    
    updated_student = await student_collection.find_one_and_update(
        {"_id": new_student.inserted_id},
        {"$set": {"name":  "praneet_update"}}
    )

    print(new_student.inserted_id, type(new_student.inserted_id), str(new_student.inserted_id))
    return updated_student

async def find():
    student = StudentModel(name="praneet")
    student_collection = core_db.get_collection("tests_new")

    new_student = await student_collection.insert_one(
        student.model_dump(by_alias=True, exclude=["id"])
    )

    get = await student_collection.find_one({"_id": new_student.inserted_id})
    
    print(get.get("naMEsUpdate"))

if __name__ == "__main__":
    import asyncio
    x = asyncio.run(find())

    # print(x)

