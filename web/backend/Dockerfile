FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 소스 전체 복사
COPY main.py .
COPY config.py .
COPY schemas.py .
COPY data_source.py .
COPY mock/ ./mock/

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
