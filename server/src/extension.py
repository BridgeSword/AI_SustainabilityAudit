# server/src/extension.py

import os
from dotenv import load_dotenv

from celery import Celery
from pymilvus import MilvusClient
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# ——— MongoDB setup ———

MONGO_URL = f"mongodb://{os.getenv('MONGO_ROOT_USER')}:{os.getenv('MONGO_ROOT_PASS')}@{os.getenv('MONGO_HOST')}:{os.getenv('MONGO_PORT')}/{os.getenv('MONGO_CORE_DB')}?retryWrites=true&w=majority"

mongo_client = AsyncIOMotorClient(MONGO_URL)
core_db      = mongo_client.get_database(os.getenv("MONGO_CORE_DB"))
def get_mongo_client():
     return core_db
# ——— Milvus setup ———
milvus_client = MilvusClient(
    uri=os.getenv("MILVUS_URI"),
    token=os.getenv("MILVUS_TOKEN")
)

# ——— Celery setup ———
celery_app = Celery(
    "sd-marag-celery",
    broker=os.getenv("CELERY_BROKER"),
    backend=os.getenv("CELERY_BACKEND"),
    broker_connection_retry_on_startup=True
)
