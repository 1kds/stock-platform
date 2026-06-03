@AGENTS.md

# web/frontend — 디자인 시스템 헌법 (자동 로드)

> 이 파일은 `web/frontend`에서 작업할 때 Claude에 자동 로드됩니다.
> **팀 공통 계약(API·HDFS·스키마)은 상위 `../../common.md`**, 이 파일은 **웹 프론트 디자인 시스템 규칙**만 담습니다.
> 디자인 시스템 배경/맥락은 → [`docs/DESIGN.md`](./docs/DESIGN.md).

스택: **Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind v4 + shadcn/ui + Storybook 8**.
방법론: **아토믹 디자인**(atoms → molecules → organisms → templates → pages).

---

## 1. 토큰 사용 규칙 (가장 중요)

- **색·간격·반경 하드코딩 금지.** `#114B5F`, `rgb(...)`, `hsl(...)`, `bg-[#...]`, `style={{color:'...'}}` 전부 금지.
- **시맨틱 토큰/클래스만 사용:**
  - 색: `bg-primary` `text-foreground` `border-border` `bg-accent` `text-muted-foreground` `bg-card`
  - 브랜드: `bg-brand-petrol` `text-brand-green` `bg-brand-cream` (필요 시)
  - 주가 등락: `text-up`(상승) `text-down`(하락) `text-flat`
  - 점수 등급: `bg-score-high` `bg-score-mid` `bg-score-low`
  - 반경: `rounded-md` `rounded-lg` (토큰 `--radius-*`)
- 토큰 **정의**는 오직 `src/app/globals.css` 한 곳. 컴포넌트에서 새 색을 정의하지 말 것.
- 새 색이 필요하면 → 먼저 `globals.css`에 토큰 추가 + `docs/DESIGN.md`에 용도 기록 → 그다음 사용.
- ⚙️ 저장 시 `check-design-tokens` 훅이 하드코딩 색을 자동 감지해 경고합니다.

## 2. 컴포넌트 구조 — 1 컴포넌트 = 4 파일

```
components/<layer>/<Name>/
├── <Name>.tsx          # 구현. forwardRef + cva(variants). 단일 책임.
├── <Name>.stories.tsx  # Storybook 스토리. 모든 의미있는 상태를 story로.
├── <Name>.types.ts     # Props 인터페이스 (export). tsx는 여기서 타입 import.
└── index.ts            # export { <Name> } from './<Name>'; export type * from './<Name>.types';
```
- 레이어: `atoms`(최소 단위) → `molecules`(atoms 조합) → `organisms`(molecules 조합) → `templates`(레이아웃 뼈대).
- `ui/`(shadcn 프리미티브)는 atoms의 **기반**. atoms는 ui/를 감싸거나 확장한다.
- 페이지(`src/app/**/page.tsx`)는 organisms/templates를 **조합만** 한다 — 페이지에 새 스타일 로직 금지.

## 3. 컴포넌트 너비 규칙

- **고정 px 너비 금지** (`w-[320px]` 금지). 컴포넌트는 `w-full`로 두고 **부모가 폭/padding으로 제어**.
- 카드·패널은 자기 너비를 모름 = 어느 그리드/칼럼에 넣어도 맞게. 최대폭은 `max-w-*`로만.

## 4. Figma 충실도 규칙

- Figma의 **원본 텍스트·라벨·숫자를 그대로** 유지. 자의적으로 카피 바꾸지 말 것.
- Figma에 **없는 variant·상태·색을 임의 생성 금지.** 필요해 보이면 먼저 보고/질문.
- 간격·폰트크기·반경은 Figma 값을 토큰에 매핑해서 사용 (가까운 토큰이 없으면 보고).
- 이미지/아이콘은 lucide-react 우선. Figma 전용 에셋은 export 후 사용.

## 5. 에이전트 위임 규칙

| 상황 | 에이전트 |
|------|----------|
| Figma URL → 컴포넌트 구현 | `figma-implementer` |
| Figma 토큰 ↔ 코드 토큰 일치 검사 | `token-checker` |
| 빌드/타입/토큰/Story 등 8항목 QA | `design-qa` (검사만) |
| 코드 전체 하드코딩 스캔 | `design-reviewer` (Figma MCP 미사용) |

## 6. 7단계 작업 프로세스 (모든 구현 작업)

1. **이해** — 요청·Figma·관련 화면 파악
2. **분석** — 어느 레이어(atom/molecule/...)인지, 재사용 가능한 기존 컴포넌트 있는지
3. **탐색** — `components/`·`ui/`·토큰(globals.css) 실제 확인 (추측 금지)
4. **계획** — 만들/고칠 파일과 토큰 매핑을 정리
5. **실행** — 코드 작성 (4파일 규칙·토큰 규칙 준수)
6. **검증** — `design-qa`로 8항목 점검, Storybook 렌더 확인
7. **완료** — 변경 요약 보고

> **코드 작성 전 사용자 승인 필수.** 계획(4단계)을 먼저 제시하고 승인받은 뒤 실행(5단계).

## 7. 빌드 명령어

```bash
npm run dev          # Next 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드 (QA ①)
npx tsc --noEmit     # 타입 체크 (QA ②)
npm run lint         # ESLint (QA ③)
npm run storybook    # Storybook 카탈로그 (localhost:6006)
npm run build-storybook   # Storybook 빌드 (QA ⑥)
```

## 8. 금지사항 (요약)

| 금지 | 대신 |
|------|------|
| 색/간격 하드코딩 (`#hex`, `bg-[...]`, inline style) | 시맨틱 토큰/클래스 |
| 고정 px 너비 | `w-full` + 부모 제어 |
| Figma에 없는 variant 임의 생성 | 보고 후 결정 |
| 원본 텍스트 자의적 변경 | 원문 유지 |
| `globals.css` 밖에서 토큰 정의 | globals.css에 추가 |
| 컴포넌트에 story/타입 파일 누락 | 4파일 규칙 준수 |
| `.env` 읽기/수정 | `.env.example`만 |
| 승인 없이 바로 코드 작성 | 계획 → 승인 → 실행 |
