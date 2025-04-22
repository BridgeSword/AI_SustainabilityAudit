import ssl
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from motor import motor_asyncio
import os
from .core.config import settings
from .core.utils import get_logger
from .core.event_handlers import start_app_handler
from .exceptions.global_exception_handler import catch_global_exceptions, validation_exception_handler

from .api import checks, carbon_reporting, embeddings, login
from .api.carbon_reporting import router as carbon_ws_router

from .extension import celery_app, milvus_client, core_db

load_dotenv()


try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

logger = get_logger(__name__)


app = FastAPI(title=settings.app_name, docs_url="/")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,  
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(catch_global_exceptions)

app.include_router(checks.router)
app.include_router(embeddings.router, prefix="/embeddings/v1")
app.include_router(carbon_reporting.router, prefix="/sdmarag/v1")
app.include_router(carbon_ws_router)
app.include_router(login.router)

app.add_event_handler("startup", start_app_handler(app, milvus_client))


app.exception_handler(validation_exception_handler)


@app.get("/")
def root():
    return JSONResponse(content={"detail": settings.app_name, "status": 200})
