import type { StorybookConfig } from "@storybook/react-vite";

// Next 16이 next/config를 제거해 @storybook/nextjs(webpack)가 동작하지 않음 →
// Storybook 8을 유지하면서 Vite 빌더(@storybook/react-vite)로 구동. (DESIGN/하네스 계획 리스크 대응)
const config: StorybookConfig = {
  // 아토믹 컴포넌트의 스토리만 수집 (4파일 규칙: <Name>.stories.tsx)
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y", // design-qa ⑦ 접근성
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  async viteFinal(viteConfig) {
    // Tailwind v4 토큰 처리 + tsconfig의 @/* 경로 별칭 지원
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    const { default: tsconfigPaths } = await import("vite-tsconfig-paths");
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push(tailwindcss(), tsconfigPaths());
    return viteConfig;
  },
};

export default config;
