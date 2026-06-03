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
