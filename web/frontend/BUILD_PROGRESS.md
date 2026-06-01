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
- [ ] 7. 서버 기동 + Puppeteer 페이지별 검증 (메인/scores/backtest/tracking/about/report)
- [ ] 8. design-qa: build/typecheck/lint/토큰/Story
- [ ] 9. 단위별 커밋 + sy.md 갱신

## 검증 결과 (페이지별)
- (아직 없음)

## 스킵/이슈 로그
- 컴포넌트 stories(.stories.tsx)는 working app 우선 위해 우선 tsx/types/index 3파일로 진행, Storybook 스토리는 8단계에서 일괄 보강 예정. (check-story-exists 훅은 이번 세션 미적용)

## 작업 로그
- iter1: 0단계 컨텍스트 수집 완료, BUILD_PROGRESS 생성. 1·2단계 착수.
