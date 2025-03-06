import os
import ssl

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pymilvus import MilvusClient

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

celery_app = Celery("sd-marag-celery", 
                    broker=os.getenv("CELERY_BROKER"), 
                    backend=os.getenv("CELERY_BACKEND"),
                    broker_connection_retry_on_startup=True
                    )


from .api import checks, carbon_reporting, embeddings

app = FastAPI(title=settings.app_name, docs_url="/")

origins = [
    # "http://localhost:8000",
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

app.add_event_handler("startup", start_app_handler(app, milvus_client))

app.exception_handler(validation_exception_handler)


@app.get("/")
def root():
	return JSONResponse(content={"detail": settings.app_name, "status": 200})
