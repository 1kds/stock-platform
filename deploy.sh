#!/bin/bash
# =============================================================
# 8팀 stock-platform 전체 배포 스크립트
# master VM에서 실행 (sudo bash deploy.sh)
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
# 실제 폴더 구조 기준 경로
declare -A SERVICE_PATHS=(
  ["stock-collector"]="collectors/stock"
  ["dart-collector"]="collectors/dart"
  ["news-collector"]="collectors/news"
  ["upbit-collector"]="collectors/upbit"
  ["spark-analyzer"]="analyzer"
  ["fastapi-server"]="web/backend"
  ["dashboard"]="web/frontend"
)

for service in "${!SERVICE_PATHS[@]}"; do
  path="${SERVICE_PATHS[$service]}"
  if [ -d "./$path" ]; then
    echo ">>> Building $service from ./$path"
    docker build -t $REGISTRY/$PROJECT/$service:latest ./$path/
    docker push $REGISTRY/$PROJECT/$service:latest
  else
    echo "⚠️  경로 없음 (건너뜀): ./$path"
  fi
done

echo ""
echo "=============================="
echo "4. CronJob 적용"
echo "=============================="
kubectl apply -f k8s/cronjobs/

echo ""
echo "=============================="
echo "5. Deployment 적용"
echo "=============================="
kubectl apply -f k8s/deployments/

echo ""
echo "=============================="
echo "6. Service 적용"
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
MASTER_IP=$(kubectl get nodes master -o jsonpath='{.status.addresses[0].address}' 2>/dev/null || echo 'master')
echo "대시보드:  http://$MASTER_IP:30000"
echo "FastAPI:   http://$MASTER_IP:30080/docs"
echo "=============================="
