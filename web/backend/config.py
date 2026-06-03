"""환경 설정 — HDFS_BASE, Mock 모드, CORS."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# HDFS 경로 루트 (common.md 7장 규약). 로컬: /tmp/stock-data, 운영: hdfs://namenode:9000
HDFS_BASE = os.environ.get("HDFS_BASE", "/tmp/stock-data")

# Mock 모드: 실제 HDFS 연동 전까지 mock/*.json 반환
USE_MOCK = os.environ.get("USE_MOCK", "true").lower() == "true"
MOCK_DIR = Path(__file__).parent / "mock"

# CORS — 프론트(Next.js) 개발 서버 허용
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
