# 8팀 주식 분석 플랫폼 — 웹 파트 아키텍처

> 발표(PPT)용 상세 설명. 각 절을 슬라이드로 그대로 옮겨 쓸 수 있게 구성.
> 코드 기준: `web/backend`(FastAPI) + `web/frontend`(Next.js). 팀 공통 계약은 `../common.md`.

---

## 0. 한 줄 요약 & 웹의 위치

> **웹 파트 = "Spark가 분석해 HDFS에 쌓아둔 결과를, 사람이 보는 화면으로 바꿔주는 계층."**
> 직접 분석·수집은 하지 않는다. **HDFS의 `/result`를 읽어서(read-only) REST API로 내보내고, 그걸 브라우저 대시보드로 그린다.**

전체 시스템에서 웹은 **맨 마지막 소비 계층(consumer)** 이고, 클러스터의 **worker3** 노드에서 상시 돌아간다.

---

## 1. 전체 데이터 흐름 (웹이 어디에 붙는가)

```
[20:00~20:40] 수집 CronJob(worker1)
   pykrx·DART·네이버뉴스 크롤링 + Gemini 감성분석
        │  write
        ▼
   HDFS /data/stock/{ohlcv, investor, news, financial}   ← 원천 데이터
        │
[07:30] Spark 분석 CronJob(worker2)
   /data 읽어 7항목 점수 계산 → Top3 선정
        │  write
        ▼
   HDFS /result/{daily_score, top3, top3_json}            ← 분석 결과
        │
        │  ★여기부터 웹★  read-only
        ▼
[상시] FastAPI 서버(worker3) ──REST/JSON──▶ [상시] Next.js 대시보드(worker3) ──▶ 브라우저
```

**핵심 경계**: `/data`(원천)와 `/result`(결과)는 분리돼 있고, **웹은 `/result`만 읽는다**(백테스팅만 예외적으로 `/data/stock/ohlcv`도 읽음). **웹은 HDFS에 절대 쓰지 않는다.**

---

## 2. 웹 내부 구조 — 2계층 (Frontend ↔ Backend)

```
┌─────────────────────── worker3 Pod 2개 ───────────────────────┐
│                                                                │
│   [Next.js 대시보드]            [FastAPI 서버]                  │
│   :3000 (NodePort 30000)  ──▶  :8000 (NodePort 30080)          │
│   - 화면 렌더링                  - REST API 5개                  │
│   - lib/api.ts 로 호출           - HDFS /result 읽기            │
│        │ HTTP(JSON)                   │ pyarrow/pandas          │
│        │                              ▼                         │
│        │                      HDFS (hdfs://namenode:9000)       │
│        ▼                                                        │
│   브라우저(사용자)                                              │
└────────────────────────────────────────────────────────────────┘
```

- **둘은 완전히 분리된 별개 서버.** 프론트는 데이터를 직접 읽지 않고, **항상 FastAPI를 통해서만** 받는다.
- 연결고리: 프론트의 `NEXT_PUBLIC_API_BASE` 환경변수가 FastAPI 주소를 가리킨다(로컬 `http://localhost:8000`).

---

## 3. 백엔드 (FastAPI) 상세

### 3.1 역할·스택
- **역할**: HDFS 분석 결과 → REST API (읽기 전용 어댑터)
- **스택**: FastAPI + uvicorn / Pydantic v2(응답 스키마 고정) / python-dotenv(환경변수) / pyarrow + pandas(HDFS Parquet 읽기)

### 3.2 엔드포인트 5개 — "어디서 뭘 가져오는가" ⭐
| 메서드·경로 | 설명 | 데이터 출처(HDFS) | 형식 |
|---|---|---|---|
| `GET /api/top3?date=` | 오늘의 Top3 추천 | `/result/top3_json/` | JSON 직접 |
| `GET /api/scores?date=` | 전체 종목 7항목 점수 | `/result/daily_score/` | Parquet |
| `GET /api/tracking?period=` | 추천 이력·적중률 | `/result/top3/` + `ohlcv` | Parquet |
| `GET /api/backtest?start=&end=&hold=` | 백테스팅(수익률·승률·MDD) | `/result/daily_score/` + `/data/stock/ohlcv/` | Parquet |
| `GET /health` | K8s Liveness용 | (200 OK) | - |

- **날짜 없으면** 최신 파티션 반환. **휴장일이면 직전 영업일 파티션으로 폴백.**
- **왜 top3만 JSON 직접 읽기?** → 대시보드 첫 화면이라 가장 빨라야 함. 나머지(점수·백테스트)는 Parquet을 pyarrow로 읽어 계산.

### 3.3 데이터 소스 추상화 (`data_source.py`) — 설계 핵심 ⭐
모든 엔드포인트는 데이터를 **직접 읽지 않고** `data_source.py`를 통해 가져온다. 여기에 **`USE_MOCK` 스위치**가 있다:

```python
def get_top3(date=None):
    if config.USE_MOCK:
        return _load_mock("top3")          # 1단계: mock/*.json
    # 3단계: pyarrow로 /result/top3_json/ 읽기 (교체 예정)
```

- `USE_MOCK=true` → `mock/*.json` 반환 (로컬 개발·발표 데모)
- `USE_MOCK=false` → HDFS 실제 데이터 읽기 (K8s 운영)
- **장점**: mock↔실연동 전환 시 **이 파일 한 곳만** 바꾸면 됨. `main.py`(엔드포인트)도, 프론트 코드도 **전혀 안 바뀜.** (= 관심사 분리)

### 3.4 환경·경로 규칙
- **`HDFS_BASE` 환경변수**: 로컬 `/tmp/stock-data`, 운영 `hdfs://namenode:9000`. **코드에 경로 하드코딩 없음** → 같은 코드가 로컬·클러스터 양쪽에서 동작.
- **CORS**: `localhost` 전 포트 허용(개발 중 3000/3001 자동 폴백 대응).
- **응답 계약은 Pydantic v2 모델로 고정** → `common.md` 6장(팀 공통 계약)과 1:1. 응답 모양이 흐트러지면 자동 검증 에러.

---

## 4. 프론트엔드 (Next.js) 상세

### 4.1 스택·방법론
- **Next.js 16 (App Router) + React 19 + TypeScript 5**
- **Tailwind CSS v4 + shadcn/ui**(new-york/neutral) + **Recharts**(차트) + **lucide**(아이콘)
- **Storybook 8**(컴포넌트 카탈로그) — 디자인 시스템 문서화·검증
- **아토믹 디자인**: atoms → molecules → organisms → templates(AppShell) → pages
  - 1 컴포넌트 = 4파일 규칙(`.tsx`/`.stories.tsx`/`.types.ts`/`index.ts`)

### 4.2 화면(페이지) 6개 + 각자 호출하는 API
| 페이지 | 경로 | 호출 API | 핵심 컴포넌트 |
|---|---|---|---|
| 메인 대시보드 | `/` | top3 + tracking + scores | Top3Grid · KpiGrid · MarketOverview · Watchlist · SectorDistribution · ReturnChart · HistoryTable |
| 전체 종목 점수 | `/scores` | scores | ScoresTable(검색·필터·정렬·미니막대) |
| 백테스팅 | `/backtest` | backtest | BacktestForm(조건식 빌더)·BacktestResult |
| 트래킹 | `/tracking` | tracking | TrackingTable·KpiGrid |
| 소개 | `/about` | (정적) | AboutSections — 아키텍처 설명 |
| 리포트 | `/report` | (정적/피드) | ReportFeed |

### 4.3 프론트 데이터 흐름
- **`lib/api.ts`** 가 유일한 API 호출 창구 — `fetch(API_BASE + path)` + TypeScript 타입(백엔드 Pydantic과 동일 모양).
- 페이지는 `useEffect`에서 `getTop3()/getScores()/...` 호출 → `useState`에 저장 → organisms에 props로 전달 → 렌더.
- **로딩/에러 상태**: `StateViews`로 분리 — 백엔드 꺼져 있으면 "백엔드 연결 실패" 표시(정상 동작).

### 4.4 디자인 시스템
- **색·간격·반경은 토큰으로만**(globals.css 단일 정의) — 하드코딩 금지.
- 브랜드 5색(petrol/green/light/sage/cream) + 점수 등급색 + **등락색은 한국 증시 관례(상승=빨강/하락=파랑)로 별도 토큰**.

---

## 5. 요청 한 번의 생애주기 (대시보드를 여는 순간)

```
1. 사용자가 브라우저로 :3000 접속
2. Next.js가 HTML 셸 + JS 번들 전송 (App Router)
3. React 마운트 → useEffect 발동 → lib/api.ts가 FastAPI로 3개 요청
      GET /api/top3   GET /api/tracking   GET /api/scores
4. FastAPI → data_source →  (USE_MOCK ? mock JSON : pyarrow로 HDFS /result 읽기)
5. Pydantic이 응답 모양 검증 → JSON 반환
6. 프론트가 JSON 수신 → setState → Top3 카드·KPI·차트(Recharts) 렌더
7. Top3 카드 클릭 → StockDetailModal에 7항목 점수바 + 선정 이유
```

---

## 6. 배포 / 런타임 (K8s)

- **노드**: master(control-plane + HDFS NameNode) + worker1(수집) + worker2(Spark) + **worker3(웹)**
- worker3에 상시 Deployment 2개(`replicas:1`, liveness probe, 리소스 제한):

| Pod | 내부포트 | NodePort | Liveness | 환경변수 |
|---|---|---|---|---|
| fastapi-server | 8000 | 30080 | `/health` | `HDFS_BASE=hdfs://namenode:9000`, `USE_MOCK=false`, Secret(DART·Gemini 키) |
| dashboard | 3000 | 30000 | `/` | `NEXT_PUBLIC_API_BASE`(FastAPI 주소) |

- 각 파트는 **Docker 이미지로 빌드 → `master:5000` 사설 레지스트리 push → `deploy.sh` 한 번으로 배포**.
- **Liveness Probe**: `/health`가 죽으면 K8s가 자동 재시작 → 무중단.

---

## 7. 설계 원칙 · 핵심 결정 (발표 강조 포인트)

1. **읽기 전용 경계** — 웹은 `/result`만 읽고 절대 안 쓴다. 분석/수집과 책임이 명확히 분리.
2. **계약 기반(SSOT)** — `common.md`에 HDFS 경로·컬럼·점수·API 응답 모양을 한 곳에 고정. 파트 간 인터페이스가 곧 계약.
3. **환경 독립** — `HDFS_BASE`·`USE_MOCK` 환경변수로 **같은 코드가 로컬/클러스터, mock/실데이터** 모두 동작.
4. **교체 지점 최소화** — 실연동 전환은 `data_source.py` 한 파일만. API·프론트 무변경.
5. **타입 안전** — 백엔드 Pydantic ↔ 프론트 TypeScript가 같은 응답 모양을 공유.

---

## 8. 현재 상태 & 정직한 한계 (질문 대비)

- **로컬/발표 데모**: `USE_MOCK=true` — `mock/*.json`으로 화면이 완전히 돈다(파이프라인 없이도 시연 가능).
- **K8s 클러스터**: `USE_MOCK=false` — 실제 Spark 결과(`/result`)를 읽음. 일부 데이터는 실연동, 나머지는 mock로 채워 "파이프라인이 한 바퀴 도는 것"을 증명.
- **알려진 작업 거리**: Spark가 내는 실제 `top3_json`은 **flat 구조**(`undervaluation_score`…)인데 웹 계약은 **nested 구조**(`scores.undervaluation`) → `data_source.py`에 **변환 어댑터** 추가가 3단계 핵심 작업.

---

## 부록 A. 응답 스키마 요약 (common.md 6장 기준)

```jsonc
// GET /api/top3
{ "date":"2026-05-28", "updated_at":"2026-05-29 08:00",
  "top3":[ { "rank":1,"symbol":"005930","name":"삼성전자","final_score":90,
    "scores":{ "undervaluation":24,"investor_flow":20,"volume_spike":13,
      "news_keyword":9,"momentum":19,"earnings":9,"risk_penalty":4 },
    "reason":"저평가·수급·모멘텀 점수가 모두 높음" } ] }

// GET /api/scores
{ "date":"...", "count":26, "scores":[ { "rank":1,"symbol":"005930","name":"삼성전자",
  "sector":"전기전자","market":"KOSPI","date":"...",
  "undervaluation_score":24, ... ,"final_score":90 } ] }

// GET /api/tracking
{ "summary":{ "hit_rate":70.6,"avg_return":2.0,"updated_at":"..." },
  "return_chart":[ {"date":"...","return":1.2} ],
  "history":[ {"date":"...","top3":[...],"avg_return_t3":2.1,"avg_return_t5":3.4,"hit":true} ] }

// GET /api/backtest
{ "period":{"start":"...","end":"..."}, "hold":3, "indicators":["per","roe"],
  "summary":{ "avg_return":2.4,"win_rate":58.3,"max_drawdown":-7.1 },
  "returns_by_horizon":[ {"horizon":"T+1","top3_return":1.2,"market_return":0.5,"excess":0.7} ] }
```

## 부록 B. 7항목 점수 체계 (common.md 5장)

| 항목 | 컬럼 | 최대 |
|---|---|---|
| 저평가 | undervaluation_score | 25 |
| 수급 | investor_flow_score | 20 |
| 거래량 | volume_spike_score | 15 |
| 뉴스 | news_keyword_score | 10 |
| 모멘텀 | momentum_score | 20 |
| 실적 | earnings_score | 10 |
| 리스크(감점) | risk_penalty | (−) |

`final_score = 저평가 + 수급 + 거래량 + 뉴스 + 모멘텀 + 실적 − 리스크감점`
