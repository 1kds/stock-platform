#!/usr/bin/env bash
# 8team 웹 프론트 — 디자인 시스템 하네스 셋업 (Storybook 8 + Vite 빌더 + 아토믹 폴더)
#
# 빌더 선택 사유: Next.js 16이 next/config를 제거해 @storybook/nextjs(webpack)가 동작 안 함.
# → Storybook 8을 유지하면서 Vite 빌더(@storybook/react-vite)로 구동한다.
# .storybook/main.ts·preview.ts 설정은 리포에 이미 포함됨(이 스크립트는 의존성만 설치).
#
# 사용: cd web/frontend && bash install.sh
set -uo pipefail
cd "$(dirname "$0")" || exit 1
echo "📂 작업 위치: $(pwd)"

echo "▶ 1) 아토믹 디자인 폴더 보장"
mkdir -p src/components/{atoms,molecules,organisms,templates}

echo "▶ 2) Storybook 8 (Vite 빌더) + Tailwind v4 통합 설치"
# React 19 / Next 16 / Vite 최신 조합 → peer-deps 완화 필요
npm i -D --legacy-peer-deps \
  storybook@^8 @storybook/react-vite@^8 \
  @storybook/addon-essentials@^8 @storybook/addon-a11y@^8 @storybook/test@^8 \
  vite @tailwindcss/vite vite-tsconfig-paths

echo "▶ 3) 설정 확인"
for f in .storybook/main.ts .storybook/preview.ts; do
  [ -f "$f" ] && echo "   ✓ $f" || echo "   ⚠ $f 없음 — 하네스 설정 파일을 확인하세요"
done
grep -q "globals.css" .storybook/preview.ts 2>/dev/null \
  && echo "   ✓ preview에 globals.css(브랜드 토큰) 연결됨" \
  || echo "   ⚠ preview.ts에 import '../src/app/globals.css'; 추가 필요"

cat <<'EOF'

✅ 셋업 완료.
   카탈로그 실행:   npm run storybook        # http://localhost:6006
   카탈로그 빌드:   npm run build-storybook  # design-qa ⑥

컴포넌트는 components/<layer>/<Name>/ 에 4파일 규칙으로 작성 (../CLAUDE.md 참조).
예시: src/components/atoms/ScoreBadge/ (ScoreBadge.tsx / .stories.tsx / .types.ts / index.ts)
EOF
