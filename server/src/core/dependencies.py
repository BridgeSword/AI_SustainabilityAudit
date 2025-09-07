"""
Dependency injection module for shared resources.
This module contains all the shared clients and resources to avoid circular imports.
"""
import os
from typing import Optional
from motor import motor_asyncio
from celery import Celery

# Global variables to store clients
_milvus_client = None
_mongo_client: Optional[motor_asyncio.AsyncIOMotorClient] = None
_core_db = None

# Initialize Celery app immediately since it's needed for decorators
celery_app = Celery("smarag-celery",
                   broker=os.getenv("CELERY_BROKER", "redis://localhost:6379/0"),
                   backend=os.getenv("CELERY_BACKEND", "redis://localhost:6379/0"),
                   broker_connection_retry_on_startup=True
                   )

def get_milvus_client():
    """Get or create Milvus client with lazy initialization."""
    global _milvus_client
    if _milvus_client is None:
        try:
            from pymilvus import MilvusClient
            milvus_uri = os.getenv("MILVUS_URI", "http://localhost:19530")
            milvus_token = os.getenv("MILVUS_TOKEN")
            _milvus_client = MilvusClient(
                uri=milvus_uri,
                token=milvus_token,
            )
        except Exception as e:
            print(f"Failed to initialize Milvus client: {e}")
            _milvus_client = None
    return _milvus_client

def get_mongo_client():
    """Get or create MongoDB client with lazy initialization."""
    global _mongo_client, _core_db
    if _mongo_client is None:
        MONGO_URL = f"mongodb://{os.getenv('MONGO_HOST', 'localhost')}:{os.getenv('MONGO_PORT', '27017')}/smarag?retryWrites=true&w=majority"
        _mongo_client = motor_asyncio.AsyncIOMotorClient(MONGO_URL)
        _core_db = _mongo_client.get_database(os.getenv('MONGO_CORE_DB'))
    return _core_db

# Create lazy milvus client for backward compatibility
class LazyMilvusClient:
    def __init__(self):
        self._instance = None
    
    def __getattr__(self, name):
        if self._instance is None:
            self._instance = get_milvus_client()
        return getattr(self._instance, name)

# Create lazy instance for milvus
milvus_client = LazyMilvusClient()
