FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# news_collector.py + news_sentiment.py (감성분석) 함께 복사
COPY news_collector.py .
COPY news_sentiment.py .

ENV PYTHONUNBUFFERED=1

# 크롤링 후 감성 분석까지 순서대로 실행
CMD ["sh", "-c", "python news_collector.py && python news_sentiment.py"]
