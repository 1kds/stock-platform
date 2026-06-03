# BUILD_PROGRESS — Figma → 코드 변환 (자율 빌드)

> `/loop` 자율 빌드 진행 추적. 매 반복마다 "다음 미완료" 이어서 진행.
> 목표: Figma 9프레임 → Next.js 코드 + mock 백엔드, 두 서버 띄워 Puppeteer로 검증.

## 컨텍스트 (확인 완료)
- 스택: Next 16 / React 19 / TS / Tailwind v4 / shadcn(base-nova) / Recharts / lucide-react. `@/*`→`src/*`.
- 토큰: `globals.css`에 브랜드 5색 + 등락(up/down) + score-high/mid/low 정의됨.
- 백엔드: FastAPI 4 엔드포인트 + /health, `USE_MOCK=true`, mock 4종 **데이터 충분**.
  - top3(3 items+scores), scores(6 rows+sector+7점수), tracking(summary+return_chart 9+history 5), backtest(summary+horizon 4).
- 기존 프론트: layout.tsx(밝은 셸), page.tsx(Top3), Top3Card(Dialog 점수바), lib/api.ts(타입 완비). ui/: badge·button·card·dialog·table.
- 디자인(내가 만든 Figma): 풀폭 상단바(로고+중앙링크 홈/소개/리포트+우 시계/아바타), 흰 사이드바(아이콘+활성 그린바), 콘텐츠 bg #F7F8F8, 카드 라운드 작게(~6).

## 체크리스트
- [x] 0. 컨텍스트 수집 + 이 파일 생성
- [x] 1. 기반: 토큰 정합(canvas bg #f7f8f8), 아토믹 폴더, cn
- [x] 2. Atoms: Button · ScoreBadge(기존) · TrendChip · Tag · StatusDot · Avatar · LogoMark (4파일, tsc 통과)
- [x] 3. Molecules: StatCard · ScoreBar · Top3Card · NavItem · DatePill · SearchInput · Dropdown · Segmented · ReportCard (4파일, tsc 통과). ※ TableRow는 별도 분자 대신 organisms에서 ui/table로 직접 구성.
- [x] 4. Organisms (14/14, tsc 통과·커밋): Topbar·Sidebar·StateViews·KpiGrid·Top3Grid·ReturnChart·HistoryTable·StockDetailModal·ScoresTable·TrackingTable·ReportFeed·BacktestForm·BacktestResult·AboutSections. ※ AboutSections는 Figma 7,650px 대비 핵심 섹션 condensed 버전(히어로·파이프라인·점수표·스택·팀+개요).
- [x] 5. AppShell(layout 재작성: Topbar+Sidebar+밝은 캔버스) + 페이지 6개(/ ·/scores ·/backtest ·/tracking ·/about ·/report). 구 Top3Card 제거. tsc + `next build`(7라우트 프리렌더) 통과.
- [x] 6. 백엔드 mock 정합 — 4종 모두 UI에 충분(확인 완료, 보강 불필요).
- [x] 7. 서버 기동 + Puppeteer 페이지별 검증 — 백엔드 :8000(use_mock) + 프론트 :3000, 6개 페이지 전부 실데이터 렌더 확인.
- [x] 8. design-qa: next build(7라우트) ✅ · tsc ✅ · eslint ✅ · 하드코딩색 0 ✅ · story 규칙(훅) ✅ · build-storybook ✅
- [x] 9. 단위별 커밋(atoms/molecules/organisms/pages/검증fix) + sy.md 갱신

## 검증 결과 (페이지별 — Puppeteer 실서버)
- / (메인): ✅ Top3 카드(강점태그 자동산출)·KPI 4·30일 차트·5일 이력. 상세 모달 연동.
- /scores: ✅ 6행 점수표(등급색 뱃지)·검색·필터·세그먼트.
- /backtest: ✅ 조건폼(체크/보유기간)·KPI 4·Top3 vs 시장 차트.
- /tracking: ✅ 기간 세그먼트·KPI·T+3/T+5 테이블.
- /about: ✅ petrol 히어로·파이프라인·점수표·스택·팀.
- /report: ✅ 최신 featured + 이력 피드(추천이력 파생).
- 공통 수정: 적중 ✅/❌ 이모지(헤드리스 두부) → lucide Check/X 아이콘으로 교체.

## 스킵/이슈 로그
- check-story-exists 훅이 실제로 활성이어서 모든 컴포넌트에 .stories.tsx 작성(4파일 규칙 충족).
- AboutSections: Figma 7,650px 상세 프로즈 대비 핵심 섹션 condensed(히어로·개요·파이프라인·점수표·스택·팀). 전체 프로즈는 후속 확장 가능.
- TableRow 분자: 미생성(테이블은 ui/table로 organisms에서 직접 구성).
- 스토리 일부(Sidebar/Topbar 등 next 라우팅 의존)는 build-storybook 컴파일은 통과하나 브라우저 렌더는 라우터 컨텍스트 필요(검증은 실Next앱 Puppeteer로 수행).

## 작업 로그
- iter1: 0단계 컨텍스트 수집 완료, BUILD_PROGRESS 생성. 1·2단계 착수.

## 2026-06-03 — 자율 폴리시/최적화 세션

> 자율 폴리시 + 최적화 + 리뷰 + 최종 검증을 1세션으로 진행. 동작·UI·텍스트·숫자 불변을 전제로 모바일 반응형·인터랙션 실연결·본문 확장·mock 보강·중복 통합을 수행.

### 영역별 변경 요약

**영역 A — 모바일 반응형 + 앱 셸/대시보드**
- 셸/사이드바: `layout.tsx` 데스크톱 고정 사이드바에 `hidden lg:block`(모바일 숨김), 콘텐츠 패딩 `p-4 sm:p-6`. Sidebar에 `variant?: "fixed" | "drawer"` + `onNavigate?` prop 추가(fixed=`w-56` 고정, drawer=`w-full` 부모 제어).
- 모바일 드로어: Topbar에 base-ui Dialog로 좌측 오프캔버스 드로어 내장. `<lg`에서만 햄버거(Menu) 노출 → 드로어에 로고·Sidebar(drawer)·중앙 링크(홈/소개/리포트), 클릭 시 닫힘. 애니메이션 `slide-in-from-left`/`slide-out-to-left`. Topbar 모바일 `flex justify-between` / 데스크톱 `lg:grid lg:grid-cols-3` 3분할 보존.
- NavItem: `onClick?` prop 추가(드로어 닫기용).
- 대시보드 그리드: Top3Grid `md:grid-cols-3`→`lg:grid-cols-3`(모바일/태블릿 1열, 데스크톱 3열), LoadingState 스켈레톤 동일 정렬. KpiGrid·차트/이력 그리드는 이미 모바일 스택이라 유지.
- ReturnChart: 이미 Recharts ResponsiveContainer `width=100%` — 변경 불필요 확인.
- StockDetailModal: DialogContent `max-h-[90vh] overflow-y-auto sm:max-w-md`(모바일 풀폭, 데스크톱 확대, 짧은 화면 스크롤).
- 토큰 규칙 준수: 색 하드코딩 없음. arbitrary 값은 상대값(`max-w-[80%]`, `max-h-[90vh]`)만, 기존 dialog 프리미티브 패턴과 동일.

**영역 B — 인터랙션 실연결(정렬·필터·세그먼트) + 데이터 페이지 반응형**
- 신규 재사용 훅 `src/lib/useTableControls.ts`: 헤더 클릭 정렬(같은 컬럼 asc/desc 토글, 다른 컬럼 desc 시작), accessors 숫자/문자(localeCompare ko) 정렬, 원본 불변.
- ScoresTable: 필터/정렬 상태를 organism 내부로 이동(전체 rows prop 수신). SearchInput(종목명·심볼 부분일치)·업종 Dropdown(동적 추출)·정렬 Dropdown·시장 Segmented(전체/KOSPI/KOSDAQ) 직접 렌더. 컬럼 헤더 클릭 정렬 + 방향 아이콘. 빈 결과 행 추가. `scores/page.tsx`는 rows만 전달하도록 단순화.
- TrackingTable: `period` prop("최근 1주"/"최근 1개월"/"전체") 추가. `filterHistoryByPeriod` export → 페이지 KPI(적중률·평균수익률·적중일수)와 테이블이 동일 집합 사용. `tracking/page.tsx`가 KPI 재계산.
- BacktestForm: 표시용 목업 → 제어 컴포넌트(value/onChange/onRun). 지표 체크(토글, aria-pressed)·보유기간 라디오(role=radio, aria-checked)·실행 버튼(onRun). BACKTEST_INDICATORS/HOLDS export. `backtest/page.tsx`가 폼 상태 소유, 실행 시 applyForm으로 mock 응답 클라이언트 계산.
- 모바일 반응형: ScoresTable/TrackingTable 테이블을 `overflow-x-auto` 래퍼로 감쌈(셀/텍스트 불변). BacktestResult는 ResponsiveContainer 사용.
- molecules controlled 보강: Dropdown을 options/value/onChange controlled 메뉴(외부 클릭 닫기, role=listbox/option)로 확장하되 options 없으면 기존 목업 트리거 유지(하위호환). DropdownOption 타입 export. Segmented/SearchInput stories에 Controlled 스토리 추가.

**영역 C — About 본문 확장 + Report 페이지 반응형**
- AboutSections: 기존 섹션 구조·헤딩·순서·데이터(STATS/PIPELINE/SCORES/STACK/TEAM)를 보존하면서 각 섹션에 Lead 1 + 문단 2~3 + 불릿 채움. 내용은 common.md 기반 사실 작성(수집 20:00~20:40 3종→/data, Spark 07:30 7지표, 리포트 08:00 Top3 JSON→/result, FastAPI 읽기전용/Next.js, 점수 6가점 만점100+리스크 감점, master1+worker3, CronJob/Deployment 시간표). 헬퍼 Lead/Body/Bullets + '배포 환경' 섹션 추가. 임의 수치 생성 없음, LLM 감성분석은 '미구현·향후 계획' 명시.
- 반응형: 히어로 `p-8`→`p-6 sm:p-8`, 제목 `text-2xl`→`text-xl sm:text-2xl`, 컨테이너 gap 응축. 파이프라인 카드 모바일 세로 스택(flex-col)+화살표 rotate-90, sm 이상 가로 흐름 복원. 점수표 `overflow-x-auto` + min-w 가로 스크롤.
- Report: 페이지 `max-w-4xl`·responsive gap·제목 적용. ReportFeed featured 카드 상단 풀폭, 나머지 목록 모바일 1열→sm 2열. ReportCard featured 패딩/제목 확대, 메타행 flex-wrap. ReportFeed.stories에 미적중 행 + SingleEntry 스토리 추가.

**영역 D — 백엔드 Mock 데이터 보강**
- scores.json: 6→26개 종목(count 26 동기화). 7개 업종 혼합, KOSPI 대형주 + KOSDAQ 성장주. final_score 90~10 분산. final_score = 6가점 합 − risk_penalty 공식 100% 일치, rank 점수 내림차순 1~26, symbol 6자리 zero-pad, 중복 없음(위메이드 112040 교정).
- tracking.json: history 5→17일(4/30~5/28), hit·avg_return 다양화. return_chart 9→25 포인트. summary.hit_rate=12/17=70.6, avg_return(T+5)=2.0으로 데이터 정합 보정.
- backtest.json: indicators에 investor_flow 추가, returns_by_horizon에 T+10·T+60 추가(T+5 보존). summary 키 동일.
- top3.json: 기존 값(삼성전자/NAVER/SK하이닉스, 90/80/70) 유지, scores 상위 3개와 일치 검증.
- data_source.py 로딩 분기·USE_MOCK 구조 미변경(불필요). 4개 파일 python3 json.load 파싱·키 집합 일치 assert 통과.

### 최적화 내용
- 중복 상수 통합: 점수 7항목(저평가·수급·거래량·뉴스·모멘텀·실적) 메타데이터(key/label/max)가 Top3Card·StockDetailModal·backtest 페이지 3곳에 중복 정의 → 단일 진실 공급원 `src/lib/scores.ts`(SCORE_ITEMS, RISK_PENALTY_MAX, ScoreItemKey)로 통합. 3곳 모두 import 파생(backtest INDICATOR_KEY는 Object.fromEntries 파생, 룩업 동일성 노드 스크립트로 검증).
- 포맷 함수 공통화: 부호 퍼센트(`+1.2%`) 표기가 BacktestResult·page.tsx·tracking/page.tsx에 산재 → `src/lib/utils.ts`의 `signedPercent()`로 통합(기존 출력과 바이트 단위 동일 검증).
- className 추출: Dropdown.tsx 트리거 버튼 스타일을 로컬 상수 TRIGGER_CLASS로 추출(기존 동작 보존).
- 의도적 미변경: TrackingTable/HistoryTable 적중 셀(신규 atom 4파일 필요·범위 위험), AboutSections SCORES 테이블(구조 상이·통합 시 UI 변경 위험), `text-[10px]`(색 아닌 폰트크기), `border-white/15`·`bg-black/30`(기존 승인된 hero/오버레이 패턴).

### 최종 검증 결과 (전부 통과)
- `npx tsc --noEmit` → ✅ 통과 (exit 0)
- `npm run lint` → ✅ 통과 (exit 0)
- `npm run build` → ✅ 통과
- `npm run build-storybook` → ✅ 통과
- 하드코딩 색 스캔(hardcodedColorHits) → ✅ 0건

### 리뷰 발견·반영 항목
> 자율 리뷰에서 식별된 항목(토큰/Figma 충실도, 접근성, 인터랙션 정합성). 이번 세션에 실제 반영된 것과 deferred를 구분 기록.
- 반영(작업 중 적용): ScoresTable/TrackingTable `overflow-x-auto` 래퍼, BacktestForm 보유기간 `role=radio`+`aria-checked`·지표 `aria-pressed`, Dropdown `role=listbox/option`·`aria-haspopup`·`aria-expanded`·외부클릭 닫기.

### 남은 deferred / remaining 항목
**계약(소유 밖) 확장 필요**
- 시장(KOSPI/KOSDAQ) 필터: ScoreRow(`lib/api.ts`, `backend/schemas.py`)에 `market` 필드 없어 실제 필터링 불가. 현재 ScoresTable은 row에 optional market 있으면 필터·없으면 '전체'로 관대 동작. 정상화하려면 api.ts·schemas.py·common.md 6장 계약/9장 로그 갱신 필요.
- 분석 기간 날짜 입력: BacktestForm 기간은 controlled(start/end)로 전달되나 편집 가능한 date picker 없음(DatePill 표시 전용·소유 밖). 페이지 INITIAL_FORM(2026-01-01~2026-05-29)에 고정. DatePill 편집 확장 또는 date-input atom 신설 필요.

**리뷰 deferred (이번 세션 미반영, 후속 권장)**
- [a11y/high] TrackingTable·HistoryTable 적중 컬럼이 Check/X 아이콘만 — 스크린리더에 적중 여부 미전달. sr-only 텍스트('적중'/'미적중') 또는 aria-label 필요.
- [a11y/med] ScoresTable 정렬 헤더에 `aria-sort` 없음(현재 정렬 컬럼/방향 미안내).
- [a11y/med] StockDetailModal에 DialogDescription 없음(콘솔 경고·본문 맥락 미연결).
- [a11y/med] SearchInput에 label/aria-label 없음(placeholder만으로는 접근 가능 이름 불안정).
- [a11y/med] BacktestForm 보유기간 radio를 감싸는 `role=radiogroup`+그룹 라벨 없음.
- [a11y/low] StateViews LoadingState에 `role=status`/`aria-busy`/`aria-live` 없음. StatusDot 색 단독 정보전달. Table caption(접근 가능 이름) 미사용. Dropdown 키보드(Esc/화살표/Enter) 미구현.
- [버그/med] 평균 수익률 KPI가 `valueTone='up'` 하드코딩 — 음수 평균수익률도 초록 표시(tracking/page.tsx, dashboard page.tsx, BacktestResult.tsx 3곳). `avgReturn >= 0 ? 'up' : 'down'`로 부호 기반 결정 권장.
- [토큰/med] AboutSections 히어로 구분선 `border-white/15`(white 리터럴) → `border-primary-foreground/15`로 교체 권장.
- [토큰/med] LogoMark가 이모지 '📈' 사용(lucide 우선 원칙·이전 이모지→lucide 마이그레이션과 불일치) → lucide 아이콘(TrendingUp/LineChart) 교체 권장.
- [토큰/low] StatusDot warn·ScoreBar penalty가 등락 전용 `up`(빨강) 토큰 차용(의미 오용). AboutSections '감점'은 `down`(파랑)으로 컴포넌트 간 불일치 → 감점/경고 색 통일(destructive 또는 down) 권장.
- [토큰/low] 4파일 규칙 동기화 미흡: StatusDot.stories에 `warn` 스토리, StatCard.stories에 `down` 스토리 누락.
- [토큰/low] Top3Grid.stories 예시 90/80/70 — common.md 9장 '예시 90/80/70 vs mockup 83/80/78 통일 예정' 미해결(차단 아님).
- [토큰/low] AboutSections 점수표 `min-w-[34rem]`(임의 최소폭, rem 기반·영향 낮음).
- [버그/low] ScoresTable 정렬 Dropdown 같은 항목 재선택 시 무동작·헤더 asc 토글이 Dropdown 라벨에 미반영. Top3Card onClick 부재여도 button 렌더. tracking/page.tsx가 백엔드 summary 대신 history 재계산('전체'에서 대시보드와 불일치 가능). ScoresTable 시장 Segmented가 market 부재로 무동작(컨트롤 비활성 권장).

**이전 세션 잔여(여전히 유효)**
- AboutSections는 Figma 7,650px 상세 대비 condensed였으나 이번 세션에 프로즈 본문 확장 완료. 표 구조는 유지.
- TableRow 분자 미생성(테이블은 ui/table로 organisms에서 직접 구성).
