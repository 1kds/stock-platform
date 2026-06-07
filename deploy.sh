#!/bin/bash
# =============================================================
# 8팀 stock-platform 전체 배포 스크립트
# master VM에서 실행
# 공통 규격: HDFS replication worker2=2, worker3=3 (§11)
# =============================================================
set -e

NAMESPACE="stock-platform"
REGISTRY="master:5000"
PROJECT="stock-platform"

echo "=============================="
echo "1. Namespace 생성"
echo "=============================="
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "=============================="
echo "2. ConfigMap / Secret 적용"
echo "=============================="
kubectl apply -f k8s/configmap/scoring-weights.yaml
kubectl apply -f k8s/secret/external-api-keys.yaml

echo ""
echo "=============================="
echo "3. Docker 이미지 빌드 & Push"
echo "=============================="
# 공통 규격 §1: Python 3.10, Java OpenJDK 17, Spark 3.5.1
# spark-analyzer는 spark_jobs/stock_analyzer.py 경로 사용 (§9)

declare -A SERVICE_PATHS=(
  ["stock-collector"]="collectors/stock"
  ["dart-collector"]="collectors/dart"
  ["news-collector"]="collectors/news"
  ["spark-analyzer"]="spark"
  ["report-generator"]="report"
  ["realtime-tracker"]="tracker"
  ["fastapi-server"]="web/backend"
  ["dashboard"]="web/frontend"
)

for service in "${!SERVICE_PATHS[@]}"; do
  path="${SERVICE_PATHS[$service]}"
  echo ">>> Building $service from ./$path"
  docker build -t $REGISTRY/$PROJECT/$service:latest ./$path/
  docker push $REGISTRY/$PROJECT/$service:latest
done

echo ""
echo "=============================="
echo "4. CronJob 5종 적용"
echo "=============================="
kubectl apply -f k8s/cronjobs/

echo ""
echo "=============================="
echo "5. Deployment 3종 적용"
echo "=============================="
kubectl apply -f k8s/deployments/

echo ""
echo "=============================="
echo "6. Service 3종 적용"
echo "=============================="
kubectl apply -f k8s/services/

echo ""
echo "=============================="
echo "7. 배포 상태 확인"
echo "=============================="
echo "--- Nodes ---"
kubectl get nodes -o wide

echo ""
echo "--- Pods (노드 분산 확인) ---"
kubectl get pods -n $NAMESPACE -o wide

echo ""
echo "--- All Resources ---"
kubectl get all -n $NAMESPACE

echo ""
echo "=============================="
echo "배포 완료!"
echo "대시보드:  http://$(kubectl get nodes master -o jsonpath='{.status.addresses[0].address}' 2>/dev/null || echo 'master'):30000"
echo "FastAPI:   http://$(kubectl get nodes master -o jsonpath='{.status.addresses[0].address}' 2>/dev/null || echo 'master'):30080/docs"
echo "=============================="
