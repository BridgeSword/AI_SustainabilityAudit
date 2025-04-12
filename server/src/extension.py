# server/src/extensions.py
import os
from celery import Celery
from pymilvus import MilvusClient
from dotenv import load_dotenv

load_dotenv()

milvus_client = MilvusClient(
    uri=os.getenv("MILVUS_URI"),
    token=os.getenv("MILVUS_TOKEN")
)

celery_app = Celery(
    "sd-marag-celery",
    broker=os.getenv("CELERY_BROKER"),
    backend=os.getenv("CELERY_BACKEND"),
    broker_connection_retry_on_startup=True
)
