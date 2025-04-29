import os
import ssl

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pymilvus import MilvusClient

from motor import motor_asyncio

from celery import Celery

from dotenv import load_dotenv

from .core.config import settings
from .core.utils import get_logger
from .core.event_handlers import start_app_handler

from .exceptions.global_exception_handler import catch_global_exceptions, validation_exception_handler


load_dotenv()

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

logger = get_logger(__name__)

milvus_client = MilvusClient(
    uri=os.getenv("MILVUS_URI"),
    token=os.getenv("MILVUS_TOKEN"),
)

MONGO_URL = f"mongodb://{os.getenv('MONGO_ROOT_USER')}:{os.getenv('MONGO_ROOT_PASS')}@{os.getenv('MONGO_HOST')}:{os.getenv('MONGO_PORT')}/{os.getenv('MONGO_CORE_DB')}?retryWrites=true&w=majority"

mongo_client = motor_asyncio.AsyncIOMotorClient(MONGO_URL)
core_db = mongo_client.get_database(os.getenv('MONGO_CORE_DB'))

def get_mongo_client():
     return core_db

celery_app = Celery("sd-marag-celery", 
                    broker=os.getenv("CELERY_BROKER"), 
                    backend=os.getenv("CELERY_BACKEND"),
                    broker_connection_retry_on_startup=True
                    )


from .api import checks, carbon_reporting, embeddings, edits

app = FastAPI(title=settings.app_name, docs_url="/")

origins = [
    # To be modified to support only the acceptable URLs later
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(catch_global_exceptions)

app.include_router(checks.router)
app.include_router(embeddings.router, prefix="/embeddings/v1")
app.include_router(carbon_reporting.router, prefix="/sdmarag/v1")
app.include_router(edits.router, prefix="/edits/v1")

app.add_event_handler("startup", start_app_handler(app, milvus_client))

app.exception_handler(validation_exception_handler)


@app.get("/")
def root():
	return JSONResponse(content={"detail": settings.app_name, "status": 200})
