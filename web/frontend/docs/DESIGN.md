# 8team 디자인 시스템 — DESIGN.md

> 브랜드 성격, 색/간격 사용 맥락, 컴포넌트 조합 규칙, 레이어 네이밍.
> 토큰의 **정의**는 `src/app/globals.css`, 사용 **규칙**은 `../CLAUDE.md`. 여기는 **왜/어디에** 쓰는지.

## 1. 브랜드 성격

주식 통합 분석 대시보드. 톤은 **신뢰감 있는 청록(petrol) + 자연스러운 그린**.
딱딱한 금융앱이 아니라 **차분하고 읽기 편한** 데이터 대시보드를 지향한다.
숫자가 주인공 → 색은 강조와 위계에만 쓰고, 넓은 면은 차분하게.

## 2. 색 팔레트 (브랜드 5색)

| 토큰 | HEX | 성격 | 주 용도 |
|------|-----|------|---------|
| `--brand-petrol` | `#114B5F` | 짙은 청록 | **헤딩·주요 텍스트·primary 액션·사이드바 배경** |
| `--brand-green` | `#1A936F` | 그린 | **강조·긍정(적중·수익)·accent·포커스 링** |
| `--brand-light` | `#88D498` | 라이트 그린 | success·하이라이트·점수 중상위 |
| `--brand-sage` | `#C6DABF` | 세이지 | **보더·옅은 배경·secondary·구분선** |
| `--brand-cream` | `#F3E9D2` | 크림 | **따뜻한 표면·muted 배경·짙은 배경 위 텍스트** |

### 시맨틱 매핑 (globals.css에서 적용됨)
- `--primary` = petrol, `--primary-foreground` = cream
- `--accent` = green, `--secondary` = sage, `--muted` = cream
- `--sidebar` = petrol(짙은 사이드바) + `--sidebar-foreground` = cream
- `--border`/`--input` = sage, `--ring` = green
- 차트 1~5 = petrol → green → light → sage → cream (브랜드 스케일)

### ⚠️ 주가 등락색은 브랜드색과 분리
한국 증시 관례를 따른다. **브랜드 그린을 "상승"으로 쓰지 말 것.**
- `--color-up` = 빨강(상승), `--color-down` = 파랑(하락), `--color-flat` = 보합(muted)
- 클래스: `text-up` `text-down` `text-flat`

### 점수 등급색
- `--score-high`(green) / `--score-mid`(light) / `--score-low`(sage) → 점수 바·분포.
- `--score-faint`(중립 회색) → 약점수 뱃지 배경. 낮은 점수를 등급색(초록)에서 빼내 물러나 보이게.
- **ScoreBadge는 4단계 색**(`lib/scores.ts scoreBadgeLevel`): strong(≥85, petrol) / high(≥70, green) / mid(≥55, light) / low(<55, faint 회색). 점수 간 대비를 시각화. (집계용 `scoreTier`는 3등급 그대로.)

### 상태·감점색 (등락색과 분리)
빨강=상승(up)이므로, "나쁨" 신호에 up을 빌려 쓰지 않는다. 의미별 전용 토큰.
- `--color-warn` = 앰버(경고) → `bg-warn`. `StatusDot tone="warn"`(상태 점).
- `--color-danger` = 전용 레드(감점·위험, up과 별개 값) → `bg-danger` `text-danger`. `ScoreBar penalty`(리스크 감점 막대).
- 경고=주황 / 상승=빨강이라 시각적으로도 구분된다.

## 3. 쓰지 말 것 (색)
- 브랜드 그린을 "상승" 신호로 ❌ (등락은 빨강/파랑 전용)
- petrol을 넓은 본문 배경으로 ❌ (사이드바/헤더 같은 좁은 면만 — 가독성)
- cream 위에 light/sage 텍스트 ❌ (대비 부족 — 텍스트는 petrol)
- 팔레트 밖 임의 색 ❌ (필요하면 토큰 추가부터)

## 4. 간격·반경
- 간격은 Tailwind 스케일(`gap-2/4/6`, `p-4`, `space-y-6`)만. 임의 px 금지.
- 카드 패딩 기본 `p-4`~`p-6`, 섹션 간 `gap-6`.
- 반경 토큰 `rounded-md`(기본 컨트롤) / `rounded-lg`(카드·패널).

## 5. 컴포넌트 조합 규칙 (아토믹)
- **atoms**: Button, Badge, Text, Icon, ScoreDot — 단일 책임, 도메인 지식 없음.
- **molecules**: atoms 2~3개 조합 — StatCard, ScoreBar, NavItem, Top3Card.
- **organisms**: 화면의 한 구역 — Sidebar, DashboardHeader, Top3Grid, HistoryTable, ReturnChart.
- **templates**: 레이아웃 뼈대(슬롯만) — DashboardTemplate(사이드바+헤더+콘텐츠 그리드).
- **pages**(`src/app`): 데이터 fetch + organisms/templates 조합. 스타일 로직 금지.
- 규칙: 하위 레이어만 import. (organism은 molecule/atom OK, atom이 organism import ❌)

## 6. Figma 레이어 네이밍 컨벤션
- 프레임(페이지): `Page/Dashboard`, `Page/Backtest`, `Page/Tracking`
- 컴포넌트: `<Layer>/<Name>` 예: `Atom/Button`, `Molecule/Top3Card`, `Organism/Sidebar`
- variant 속성: `state=default|hover|disabled`, `rank=1|2|3`, `tone=up|down|flat`
- 토큰(Figma Variables): 코드 토큰명과 1:1 — `brand/petrol`, `score/high`, `color/up`
- 이 컨벤션이 맞아야 `token-checker`·`figma-implementer`가 정확히 매핑된다.

## 7. 8team Figma 파일
- 파일: `8team` (project 608459028) — fileKey `mwe4me38OXOG8M689kFms5`
- URL: https://www.figma.com/design/mwe4me38OXOG8M689kFms5
