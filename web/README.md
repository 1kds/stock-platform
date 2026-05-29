# 웹 파트 (조상윤)

Spark 분석 결과(Top3·점수)를 HDFS에서 읽어 FastAPI로 제공하고, Next.js로 보여주는 웹.
현재 **1단계: Mock 데이터**로 동작 (HDFS 연동은 3단계 예정).

```
web/
├── backend/    # FastAPI (포트 8000) — Mock JSON 반환
└── frontend/   # Next.js (포트 3000) — 대시보드
```

## 실행 방법

### 1) 백엔드 (FastAPI)
```bash
cd web/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # 필요 시 값 수정
uvicorn main:app --reload --port 8000
```
- API: http://localhost:8000
- 자동 문서: http://localhost:8000/docs

### 2) 프론트엔드 (Next.js)
```bash
cd web/frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_BASE=http://localhost:8000
npm run dev
```
- 화면: http://localhost:3000

> 두 서버를 모두 켜야 메인 대시보드에 Top3가 표시됩니다.

## 엔드포인트 (common.md 6장 계약)

| 경로 | 설명 |
|------|------|
| `GET /api/top3` | 오늘의 Top3 |
| `GET /api/scores` | 전체 종목 점수 |
| `GET /api/tracking?period=` | 추천 이력·적중률 |
| `GET /api/backtest?start=&end=&hold=` | 백테스팅 |
| `GET /health` | 헬스체크 (K8s Liveness) |

## Mock → 실제 HDFS 전환

`backend/data_source.py` 의 `USE_MOCK=false` 분기만 pyarrow HDFS 읽기로 채우면 됨.
엔드포인트·프론트 코드는 그대로.
