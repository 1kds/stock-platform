# -------------------------------------------------------
# spark-analyzer Dockerfile
# 공통 규격: Java OpenJDK 17 + Spark 3.5.1 + Python 3.10
# 실행: spark-submit /app/spark_jobs/stock_analyzer.py (§9)
# -------------------------------------------------------
FROM openjdk:17-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV SPARK_VERSION=3.5.1
ENV HADOOP_VERSION=3
ENV SPARK_HOME=/opt/spark
ENV PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin
ENV PYSPARK_PYTHON=python3

RUN wget -q https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
    && tar xzf spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz -C /opt \
    && mv /opt/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION} ${SPARK_HOME} \
    && rm spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# 실제 폴더 구조: analyzer/spark_jobs/stock_analyzer.py
COPY spark_jobs/ ./spark_jobs/

ENV PYTHONUNBUFFERED=1

CMD ["spark-submit", "--master", "local[*]", "/app/spark_jobs/stock_analyzer.py"]
