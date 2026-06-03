import type { Preview } from "@storybook/react";
// 브랜드 토큰 적용: 디자인 시스템 토큰이 정의된 전역 스타일 주입
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // 토큰 배경 위에서 컴포넌트 확인 (cream/white)
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "#ffffff" },
        { name: "cream", value: "#f3e9d2" },
        { name: "petrol", value: "#114b5f" },
      ],
    },
    a11y: { test: "todo" },
  },
};

export default preview;
