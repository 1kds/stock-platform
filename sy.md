# 웹파트 작업 브리핑 — 조상윤

> 새 Claude 세션에 **내 담당 파트 맥락**을 한 번에 전달하는 개인 작업 파일.
> **공통 계약(HDFS 경로·컬럼 스키마·점수 체계·API 응답 모양·K8s 배치)은 → [`common.md`](./common.md) 참조.**
> 여기엔 웹 전용 설계 + 진행 상태 + 다음 할 일 + 작업 로그만 둔다.
>
> _마지막 갱신: 2026-06-02_

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

## 7. 지금까지 한 일 (현황)

**🎨 Figma 디자인 — 9개 프레임 완성** (fileKey `mwe4me38OXOG8M689kFms5`)

| # | 화면 | 내용 |
|---|------|------|
| ① | 컴포넌트 라이브러리 | Colors(토큰+hex)·Buttons·Badges&Tags·Form·Data·Navigation·Cards |
| ② | 메인 대시보드 | 풀폭 상단바 + 흰 사이드바 + KPI 4 + Top3 카드 3 + 30일 차트 + 5일 이력 |
| ③ | 백테스팅 | 조건 폼 + 결과 KPI + 누적수익률 차트 + 상세통계 |
| ④ | 트래킹 | 기간 필터 + 적중률 KPI + 추천 이력 테이블(T+3/T+5) |
| ⑤ | 전체 종목 점수 | 검색·필터 + 12행 점수 테이블 (`/api/scores`) |
| ⑥ | 종목 상세 모달 | 7항목 점수바 + 선정 이유 |
| ⑦ | 상태 화면 | 로딩 스켈레톤 · 백엔드 연결 실패 · 휴장일 빈 상태 |
| ⑧ | 소개 | 7,650px 스크롤 — 개요·아키텍처·수집·HDFS·분석/점수·웹·인프라·스택·팀 |
| ⑨ | 리포트 | 일일 분석 리포트 피드 (최신 featured + 지난 목록) |

- 디자인 톤: 브랜드 5색, SaaS 앱 셸(풀폭 상단바+사이드바), 상단 링크 중앙(홈·소개·리포트), 흰 사이드바, 배경 `#F7F8F8`, 카드 라운드 축소.

**🛠 디자인 시스템 하네스** (로컬 전용 `.claude/`, gitignore — 팀 커밋 안 됨)
- 규칙 문서: `web/frontend/CLAUDE.md` + `docs/DESIGN.md`
- 서브에이전트 4(figma-implementer/token-checker/design-qa/design-reviewer) + 훅 4(.mjs)
- **Storybook 8(Vite 빌더)** + `globals.css` 브랜드 토큰 + 예시 atom `ScoreBadge`(4파일 규칙)

**⚙️ 코드 (이전 세션)**
- 백엔드 FastAPI: 엔드포인트 4 + `/health` + Mock JSON 4종 (`USE_MOCK=true`)
- 프론트 Next.js: 레이아웃(네비+사이드바) + 메인 Top3 카드 + 점수 모달 (※ Figma 디자인보다 구버전)

---

## 8. 앞으로 해야 할 일

> Figma 디자인은 사실상 완성. 이제 **디자인 → 코드**로 옮기는 단계가 핵심.
> 데이터는 당분간 Mock 유지(`USE_MOCK=true`), 실연동·K8s는 타 팀 작업 후로 미룸.

**📍 1단계 — Figma 디자인 → Next.js 코드 반영** ⬅ 다음 작업
> 현재 프론트 코드(`page.tsx` 등)는 Figma 디자인보다 구버전. 디자인을 코드로 구현하는 게 1순위.
- [ ] 아토믹 폴더(atoms/molecules/organisms/templates) 구축 + 토큰 코드 정합
- [ ] 메인 대시보드 코드 갱신: 앱 셸(상단바+사이드바)·KPI 4·Top3 슬림 카드·30일 차트·5일 이력 테이블
- [ ] 서브 페이지 코드: 전체 종목 점수 / 백테스팅 / 트래킹 / 소개 / 리포트
- [ ] 종목 상세 모달(7항목 점수바) + 상태 화면(로딩/에러/빈)
- [ ] (`figma-implementer` 에이전트 활용 — 1컴포넌트=4파일 규칙)

**📍 2단계 — Mock 데이터 보강**
- [ ] tracking/scores mock에 차트·이력·종목 점수 필드 채우기 (백엔드 로직·HDFS는 손 안 댐)

**🔜 3단계 — HDFS 실연동** (수집/분석 팀 작업 후)
- [ ] `data_source.py`의 `USE_MOCK` 분기 → pyarrow로 `/result` Parquet/JSON 읽기
- [ ] 휴장일 직전 영업일 폴백 구현

**🔜 4단계 — K8s 배포** (허재성 협업)
- [ ] Dockerfile(fastapi/dashboard) + Deployment/CronJob YAML + liveness probe 통합 테스트

**기타**
- [ ] 소개·리포트는 현재 Figma만 → 코드 구현 시 함께
- [ ] (선택) 모바일 반응형, 다크모드
- [ ] DESIGN.md 사이드바 색 기준 갱신 여부 결정 (현재 코드/디자인은 흰색, 문서는 petrol)

---

## 9. 작업 로그 (세션 복원용 — 날짜별 한 줄)

> 세션 끊겨도 "어디까지 했나" 복원되게 매번 한 줄씩 추가.

- **2026-05-29**: 팀 문서 구조 정리 — 공통 `common.md` + 개인 `sy.md` 분리 생성. 아직 웹 코드 착수 전(1단계 Mock 예정).
- **2026-05-29**: 기술 스택 확정 — 하우스 스택(Jyos/whatcook) 따라 Next 16 + App Router + shadcn/ui(neutral/lucide) + Tailwind v4, 백엔드 FastAPI + pyarrow. 폴더는 web/frontend + web/backend. (Supabase/Toss/AI 라이브러리는 드롭)
- **2026-05-29**: 폴더 정리 + 스캐폴딩 완료. 백엔드(FastAPI): config/schemas/data_source/main + mock 4종, venv 설치, 5개 엔드포인트 실HTTP 검증 통과. 프론트(Next 16.2.6 + shadcn base-nova): 레이아웃(네비+사이드바), 메인 페이지 Top3 카드+점수 모달, backtest/tracking placeholder, lib/api.ts(타입+fetch). `npm run build` 통과.
- **2026-05-29**: 로컬 서버 띄워 화면 검증 완료. 백엔드 8000 + 프론트(포트 3000은 `current` 프로젝트가 점유 중이라 **3001**로 뜸). Puppeteer 스크린샷 — 메인 대시보드에 Top3 카드(삼성전자90/NAVER80/SK하이닉스70) 정상 렌더링 확인. CORS를 localhost 전 포트 허용으로 수정(`main.py`). **방침 확정: 앞으로 프론트 디자인만, 데이터는 Mock 고정** (8장 단계 참고). 다음: 1단계 메인 대시보드(요약 지표 카드)부터.
- **2026-06-02 (Figma→코드 자율 구현, /loop 야간)**: Figma 9프레임 디자인을 실제 코드로 구현 완료. 아토믹 — atoms 6(Button·ScoreBadge·TrendChip·Tag·StatusDot·Avatar·LogoMark)·molecules 9(StatCard·ScoreBar·Top3Card·NavItem·DatePill·SearchInput·Dropdown·Segmented·ReportCard)·organisms 14(Topbar·Sidebar·StateViews·KpiGrid·Top3Grid·ReturnChart·HistoryTable·StockDetailModal·ScoresTable·TrackingTable·ReportFeed·BacktestForm·BacktestResult·AboutSections), 각 4파일(Storybook 스토리 포함). AppShell(layout.tsx: Topbar+Sidebar+밝은 캔버스) + 6개 페이지(/ ·/scores ·/backtest ·/tracking ·/about ·/report), lib/api로 mock 백엔드 연동, StateViews로 로딩/에러 보존. 검증: tsc·`next build`(7라우트 프리렌더)·eslint·하드코딩색 0·build-storybook 전부 통과. 백엔드(:8000)+프론트(:3000) 실서버 기동 후 **Puppeteer로 6개 페이지 전부 실데이터 렌더 확인**(적중 ✅/❌는 lucide Check/X 아이콘으로 교체). 진행 추적 web/frontend/BUILD_PROGRESS.md. 단위별 커밋(atoms/molecules/organisms/pages). 다음: 디테일 폴리시 → HDFS 실연동 → K8s.
- **2026-06-02 (소개 상세화 + 컴포넌트 라이브러리)**: ① **컴포넌트 라이브러리(①)** 전면 재구성(폭 960, 다른 프레임 우측 이동) — Colors(브랜드/시맨틱/데이터·점수 토큰+hex)·Buttons·Badges&Tags·Form(검색/드롭다운/세그먼트/날짜/체크/라디오)·Data(점수바/KPI/테이블행)·Navigation(사이드바항목/상단링크)·Cards 섹션으로 정리. ② **소개 페이지(⑧) 상세화** — 다중 에이전트 워크플로(7섹션 병렬 집필, 실제 collectors/ 코드까지 Read해 pykrx·DART API·BeautifulSoup 등 정확히 반영)로 본문 생성 후 높이 자동(7,650px) 스크롤형으로 조립: 히어로(태그라인+지표4) → 개요 → 아키텍처+파이프라인도 → 수집 → HDFS → 분석/점수+7항목 배점표 → 웹 → 인프라+CronJob표 → 기술스택 → 팀. 각 섹션 lead+문단2~4+불릿. 라운드 축소·#F7F8F8 배경 톤 유지.
- **2026-06-02 (소개·리포트 + 배경)**: 콘텐츠 배경을 칙칙한 녹회색(#eef1f0)→밝은 뉴트럴 **#F7F8F8** 으로 전 화면 통일. 상단 링크(홈·소개·리포트) **중앙 정렬**(절대배치). **⑧ 소개 페이지**(petrol 히어로 + 데이터 파이프라인 5단계 다이어그램 + 기술 스택 5카드 + 팀 4명) + **⑨ 리포트 페이지**(일일 분석 리포트 — 최신 featured 카드 + 지난 리포트 목록, 블로그 피드형). 소개/리포트는 상단 링크 활성·사이드바 비활성(소개성 페이지 IA). 현재 Figma 프레임 9개.
- **2026-06-02 (화면 보강)**: 계약(common.md 6장)·sy.md 대비 누락 화면 점검 후 Figma에 추가. **⑤ 전체 종목 점수 페이지**(`/api/scores` — 검색·업종/정렬 필터·시장 세그먼트 + 12행 테이블: 순위/종목/업종/최종점수/저평가·수급·모멘텀/등락), **⑥ 종목 상세 모달**(7개 지표 점수바 + 선정 이유 — 카드에서 뺀 상세), **⑦ 상태 화면**(로딩 스켈레톤·백엔드 연결 실패·휴장일 빈 상태). 상단바에 **홈·소개·리포트** 텍스트 링크 추가(소개=분산 아키텍처, 리포트=일일 리포트 피드 / 사이드바 기능과 역할 분리), 사이드바에 **종목 점수** 메뉴 추가(4항목). 사이드바는 사용자 요청으로 **흰색 테마**로 변경(원래 DESIGN.md는 petrol — 문서 갱신은 보류). 현재 Figma 프레임 7개.
- **2026-06-01 (UI 단순화)**: 다중 에이전트 워크플로(4 패러다임 채점→합성→적대 검증)로 단순화 스펙 도출 후 Figma 적용. **떠있는 둥근 카드형 → 실무 SaaS 앱 셸**(풀폭 얇은 상단바 + 풀높이 사이드바 + 패딩 콘텐츠)로 재구성. 상단바: petrol 로고마크+워드마크 / 시계+"08:00 업데이트"+아바타(긴 풀네임·부제·2줄 날짜 제거). 사이드바: 짙은 petrol 유지(DESIGN.md 규약), MENU 라벨·점·파이프라인 푸터 제거, 아이콘+라벨, 활성=절제된 그린 좌측바+옅은 오버레이(과채도 알약 폐기). 본문: 날짜 페이지 헤더로, Top3 카드 슬림화(항목 점수바 제거), 1위 petrol 보더 위계. 원칙='색은 틀 아닌 데이터에만, green≠상승'. 3화면(메인/백테/트래킹) 전부 일관 적용.
- **2026-06-01 (UI 디자인)**: **Figma에 전체 UI 디자인 완성** (fileKey `mwe4me38OXOG8M689kFms5`). 한 페이지에 4개 영역 — ① Components 라이브러리(ATOMS: Button·Score Badge·Trend Chip / MOLECULES: KPI Stat Card·Score Bar·Top3 Card·Nav Item), ② **메인 대시보드**(네비바+petrol 사이드바+KPI 4카드+Top3 추천카드 3개[점수바 포함]+30일 성과 막대차트+최근 5일 이력 테이블), ③ 백테스팅(조건 폼[기간·지표 체크·보유기간 라디오]+결과 KPI+누적수익률 차트+상세통계), ④ 트래킹(기간 필터+적중률 KPI+추천 이력 테이블 T+3/T+5/적중). 브랜드 5색 적용, 전부 auto-layout. 다음: 이 디자인을 `figma-implementer`로 Next 코드(4파일 규칙)로 변환.
- **2026-06-01**: **아토믹 디자인 + 디자인 시스템 하네스 도입.** ① Figma: 본인 Pro 계정에 `8team` 프로젝트(608459028) + 파일 생성(fileKey `mwe4me38OXOG8M689kFms5`). ② 브랜드 5색(#114B5F petrol/#1A936F green/#88D498 light/#C6DABF sage/#F3E9D2 cream) → `globals.css` 토큰 + 시맨틱 remap(primary=petrol, accent=green, 사이드바=petrol). 등락색은 증시 관례(상승=빨강/하락=파랑) 별도 토큰 분리. ③ 하네스(로컬 전용, `.claude/` gitignore): 규칙 `web/frontend/CLAUDE.md`·`docs/DESIGN.md`, 에이전트 4종(figma-implementer/token-checker/design-qa/design-reviewer), 훅 4종(.mjs: 하드코딩색 감지·Story누락·`.env`보호·OS알림). 4종 훅 동작 검증 OK. ④ **Storybook 8** 도입 — Next 16이 `next/config` 제거해 `@storybook/nextjs`(webpack) 실패 → **Vite 빌더(@storybook/react-vite)** 로 전환해 빌드 성공. 첫 atom `ScoreBadge`(4파일 규칙) 생성, 빌드 CSS에 브랜드 토큰 컴파일 확인. 다음: atoms 더 만들고 메인 대시보드 컴포넌트(StatCard/ReturnChart/HistoryTable) 아토믹으로 재편.
