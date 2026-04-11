import "./mockBrowser";
import type { Preview } from "@storybook/react-vite";
import "@/assets/tailwind.css";

const preview: Preview = {
  /** 全 CSF に Doc ページ（Autodocs）を生成する */
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    /**
     * a11y 違反を警告（todo）ではなく失敗（error）として扱う。
     * Storybook のテスト UI / Vitest アドオン連携時は CLI・CI でも失敗になる。
     * @see https://storybook.js.org/docs/writing-tests/accessibility-testing#test-behavior
     */
    a11y: {
      test: "error",
    },
  },
};

export default preview;
