# 웹파트 작업 브리핑 — 조상윤

> 새 Claude 세션에 **내 담당 파트 맥락**을 한 번에 전달하는 개인 작업 파일.
> **공통 계약(HDFS 경로·컬럼 스키마·점수 체계·API 응답 모양·K8s 배치)은 → [`common.md`](./common.md) 참조.**
> 여기엔 웹 전용 설계 + 진행 상태 + 다음 할 일 + 작업 로그만 둔다.
>
> _마지막 갱신: 2026-05-29_

---

## 0. 응답 톤 (개인 취향 — 공통 파일엔 넣지 말 것)

- 호칭: **"주인님"**
- 어체: **"~입니다"** 체

---

## 1. 내 담당 한 줄

**웹 파트 전체 = FastAPI 백엔드 + Next.js 프론트엔드** (둘 다 worker3 Pod).
Spark가 분석한 결과를 HDFS에서 **읽어서** REST API로 주고, 화면에 그린다. (HDFS 쓰기는 안 함)

---

## 2. 기술 스택 (내 하우스 스택 = Jyos/whatcook과 동일)

**프론트엔드** (`apps/web`)
| 항목 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 + React 19 + TypeScript 5 | App Router, `src/app`, `@/` alias |
| 스타일 | Tailwind CSS v4 | `@tailwindcss/postcss` |
| UI 키트 | **shadcn/ui** | style `new-york`, baseColor `neutral`, lucide (Jyos 설정 복제) |
| cn 유틸 | clsx + tailwind-merge | |
| 차트 | Recharts | shadcn `chart` 컴포넌트 기반(수익률 선·점수 바) |
| 아이콘 | lucide-react | |
| 패키지 매니저 | npm | |

**백엔드** (`services/api`)
| 항목 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | FastAPI + uvicorn[standard] | Jyos face-ai와 동일 베이스 |
| 스키마 | Pydantic v2 | common.md 6장 응답 계약 고정 |
| 환경변수 | python-dotenv | HDFS_BASE 등 |
| HDFS 읽기 | pyarrow + pandas | Parquet 읽기 (실연동 단계) |
| 배포 | Docker + K8s Deployment (worker3) | |

> 드롭(타 프로젝트 전용): Supabase·Toss·AI 라이브러리·framer-motion·zod.
> 엔드포인트 목록·응답 JSON 스키마·HDFS 경로는 `common.md` 6장 참조.

---

## 3. 페이지별 상세 구성 (웹 전용)

### 3.1 메인 대시보드 (`/`)
```
┌──────────────── 네비게이션 바 ────────────────┐
├──────────┬─────────────────────────────────┤
│  사이드  │  Top3 카드 (3개 가로)             │
│   바     │  요약 지표 카드 (3개)             │
│          │  30일 수익률 차트 │ 5일 추천 이력 │
└──────────┴─────────────────────────────────┘
```
- **네비바**: 서비스명, 오늘 날짜, 마지막 업데이트(08:00)
- **사이드바**: 메인 / 백테스팅 / 트래킹
- **Top3 카드**: 순위·종목명·최종점수 → 클릭 시 **모달**(항목별 점수 바 차트 + 선정 이유)
- **요약 지표 카드**: 적중률 / 평균 수익률 / 업데이트 시간
- **30일 수익률 차트**: Recharts 선그래프
- **최근 5일 추천 이력 테이블**: 날짜 / 1·2·3위 / 평균 수익률 / 적중(✅❌)
- 출처: `GET /api/top3`, `GET /api/tracking`

### 3.2 백테스팅 (`/backtest`)
- 입력: 분석 기간(DatePicker), 지표 조건(체크박스), 보유기간(T+1/3/5/20 라디오), 실행 버튼
- 결과: 기간별 수익률 차트 + 승률 + 요약 테이블(평균 수익률·승률·최대 낙폭)
- 흐름: 입력 → `GET /api/backtest?start=&end=&hold=` → FastAPI가 HDFS daily_score+ohlcv 읽어 계산 → 시각화

### 3.3 트래킹 (`/tracking`)
- 추천 이력 목록(날짜별 Top3), 실제 수익률(T+3·T+5), 적중률, 기간 필터(1주/1개월/전체)
- 적중률 = 수익률 양수 추천 수 / 전체 추천 수 × 100
- 현재 **관리자 단일 뷰**. 사용자별 DB는 향후 확장(미구현).

> 검증 수식(수익률·승률·최대낙폭·초과수익률)은 `common.md` 또는 보고서 8장 기준 그대로 사용.

---

## 4. 폴더 구조 (web/ 안에 frontend + backend)

> 리포 전체는 파트별 최상위 폴더(`collectors/`, `web/`, ...). 내 파트는 `web/` 하나.

```
web/
├── frontend/                    # Next.js (App Router)
│   ├── src/app/
│   │   ├── layout.tsx           # 네비·사이드바 공통 레이아웃
│   │   ├── page.tsx             # 메인 대시보드 /
│   │   ├── backtest/page.tsx    # /backtest
│   │   └── tracking/page.tsx    # /tracking
│   ├── src/components/
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   └── Top3Card.tsx, ScoreModal.tsx, ReturnChart.tsx
│   ├── src/lib/
│   │   ├── api.ts               # FastAPI 호출
│   │   └── utils.ts             # cn() (clsx+tailwind-merge)
│   ├── components.json          # shadcn 설정 (new-york/neutral)
│   └── package.json
├── backend/                     # FastAPI
│   ├── main.py                  # 엔드포인트 4개 + /health
│   ├── config.py                # HDFS_BASE, USE_MOCK 등
│   ├── schemas.py               # Pydantic 응답 모델
│   ├── data_source.py           # Mock JSON 읽기 → 나중에 HDFS 교체
│   ├── analytics.py             # 수익률·승률 계산 (나중)
│   ├── mock/                    # Mock JSON (top3/scores/tracking/backtest)
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
└── README.md                    # 웹 실행법

# K8s 배포 YAML은 리포 최상위 k8s/ (허재성 담당)
```

---

## 5. 웹 전용 고려사항

- **읽기 전용**: FastAPI는 HDFS에서 읽기만. 쓰기 절대 금지.
- **JSON 우선**: 메인 Top3는 `/result/top3_json/` JSON 직접 읽기가 제일 빠름.
- **Parquet 읽기**: 백테스팅·트래킹은 Parquet → pyarrow 필요.
- **휴장일 폴백**: 당일 파티션 없으면 직전 영업일 파티션 사용.
- **Liveness**: `/health` 엔드포인트 필수(K8s 자동 재시작).
- **백테스팅 성능**: 긴 기간이면 여러 파티션 읽어 느릴 수 있음 → 결과 캐싱 or Spark 호출 분리 고려.
- **발표 포인트**: "이 데이터가 HDFS 어디서 왔는지" 설명 가능해야 함. 단순 추천이 아니라 분산 처리 아키텍처가 평가 대상.

---

## 6. 로컬 실행 — 백엔드 + 프론트 동시에 ⭐

> 프론트가 백엔드 API를 호출하는 구조라, **두 서버를 동시에 켜야** 화면에 데이터가 뜬다.
> 하나만 켜면 안 됨 — 둘 다 떠 있어야 "잘 돌아가는지" 확인 가능.

**터미널 2개 필요:**

```bash
# 터미널 ① — 백엔드 (FastAPI, 포트 8000)
cd web/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# 터미널 ② — 프론트 (Next.js, 포트 3000)
cd web/frontend
npm run dev
```

**확인 방법:**
- 브라우저 `http://localhost:3000` → Top3 카드 3개 보이면 정상 (카드 클릭 → 점수 모달)
- 백엔드 단독 확인: `http://localhost:8000/docs` (FastAPI 자동 문서)
- 프론트만 켜고 백엔드 끄면 → 메인 화면에 **"백엔드 연결 실패"** 메시지 표시 (정상 동작 — 백엔드 켜면 해결됨)

**연결 고리:** 프론트 `.env.local`의 `NEXT_PUBLIC_API_BASE=http://localhost:8000` 주소로 API를 호출한다.
전체 실행법은 `web/README.md` 참조.

---

## 7. 개발 단계 & 현재 위치

| 단계 | 상태 | 내용 |
|------|------|------|
| 1. 화면 구성 (Mock) | 🔄 진행 중 | 레이아웃+메인 Top3 렌더링 검증 완료, 세부(지표·차트·이력)·서브페이지 남음 |
| 2. FastAPI 백엔드 | ✅ 기본 완료 | 엔드포인트 4개 + /health, Mock 반환, 실HTTP 검증됨 |
| 3. HDFS 실연동 | ⏳ 예정 | pyarrow namenode 연결, Mock→실데이터 |
| 4. K8s 배포 | ⏳ 예정 | Dockerfile, Deployment YAML, 통합 테스트 |

---

## 8. 앞으로 할 일 — 웹 디자인 단계별 (Mock 고정)

> **방침: 앞으로 프론트 UI/디자인에만 집중. 데이터는 계속 Mock (`USE_MOCK=true`).**
> HDFS 실연동(3단계)·K8s(4단계)는 수집/분석/인프라 팀 작업 끝난 뒤로 미룸.
> 새 화면에 데이터가 더 필요하면 **`web/backend/mock/*.json`만 보강** (백엔드 로직·HDFS 손 안 댐).

**✅ 완료**
- [x] Mock JSON 4종 + FastAPI 엔드포인트 4개 + `/health`
- [x] 레이아웃(네비+사이드바), 메인 Top3 카드 + 점수 모달
- [x] 로컬 실행·화면 렌더링 검증 (Puppeteer 스크린샷 OK)

**📍 1단계 — 메인 대시보드 완성** ⬅ 다음 작업
- [ ] 요약 지표 카드 3개 (적중률 / 평균 수익률 / 업데이트 시간)
- [ ] 30일 수익률 차트 (Recharts 선그래프)
- [ ] 최근 5일 추천 이력 테이블 (날짜 / 1·2·3위 / 평균 수익률 / 적중 ✅❌)

**📍 2단계 — 트래킹 페이지** (1단계 컴포넌트 재사용)
- [ ] 추천 이력 목록 (실제 수익률 T+3·T+5)
- [ ] 적중률 + 기간 필터 (최근 1주 / 1개월 / 전체)

**📍 3단계 — 백테스팅 페이지**
- [ ] 입력 폼 (기간 DatePicker · 지표 체크박스 · 보유기간 라디오 · 실행 버튼)
- [ ] 결과 (기간별 수익률 차트 · 승률 · 요약 테이블)

**📍 4단계 — 디자인 폴리시**
- [ ] 점수 색상 규칙, 로딩/에러/빈 상태, 반응형, (다크모드 선택)

**🔜 나중 (디자인 외 — 타 팀 작업 후)**
- [ ] HDFS 연동 (pyarrow, `data_source.py`의 `USE_MOCK` 분기 교체)
- [ ] Docker 이미지 + K8s 배포 (허재성 협업)

---

## 9. 작업 로그 (세션 복원용 — 날짜별 한 줄)

> 세션 끊겨도 "어디까지 했나" 복원되게 매번 한 줄씩 추가.

- **2026-05-29**: 팀 문서 구조 정리 — 공통 `common.md` + 개인 `sy.md` 분리 생성. 아직 웹 코드 착수 전(1단계 Mock 예정).
- **2026-05-29**: 기술 스택 확정 — 하우스 스택(Jyos/whatcook) 따라 Next 16 + App Router + shadcn/ui(neutral/lucide) + Tailwind v4, 백엔드 FastAPI + pyarrow. 폴더는 web/frontend + web/backend. (Supabase/Toss/AI 라이브러리는 드롭)
- **2026-05-29**: 폴더 정리 + 스캐폴딩 완료. 백엔드(FastAPI): config/schemas/data_source/main + mock 4종, venv 설치, 5개 엔드포인트 실HTTP 검증 통과. 프론트(Next 16.2.6 + shadcn base-nova): 레이아웃(네비+사이드바), 메인 페이지 Top3 카드+점수 모달, backtest/tracking placeholder, lib/api.ts(타입+fetch). `npm run build` 통과.
- **2026-05-29**: 로컬 서버 띄워 화면 검증 완료. 백엔드 8000 + 프론트(포트 3000은 `current` 프로젝트가 점유 중이라 **3001**로 뜸). Puppeteer 스크린샷 — 메인 대시보드에 Top3 카드(삼성전자90/NAVER80/SK하이닉스70) 정상 렌더링 확인. CORS를 localhost 전 포트 허용으로 수정(`main.py`). **방침 확정: 앞으로 프론트 디자인만, 데이터는 Mock 고정** (8장 단계 참고). 다음: 1단계 메인 대시보드(요약 지표 카드)부터.
