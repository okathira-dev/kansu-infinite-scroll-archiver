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
  },
};

export default preview;
