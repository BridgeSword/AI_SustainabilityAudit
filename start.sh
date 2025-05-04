#!/bin/sh
mkdir -p server/src/carbon_reports
mkdir -p server/src/VS_files
mkdir -p server/src/user_files
export APP_ENV=local
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
poetry run uvicorn server.src.main:app \
    --host 0.0.0.0 \
    --port 9092 \
    --workers 1 \
    --timeout-keep-alive 1000000 & \
celery -A server.src.main.celery_app worker \
    -l info --pool=threads & \
celery -A server.src.main.celery_app flower
# --reload
