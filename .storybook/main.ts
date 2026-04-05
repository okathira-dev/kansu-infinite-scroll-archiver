import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const rootDir = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  /** `preview` の `tags: ['autodocs']` と整合 */
  // docs: {
  //   autodocs: "tag", // preview.tsx で tags: ['autodocs'] と設定しているため不要？ 型エラーが出る
  // },
  /**
   * ArgTypes 自動推論は既定の `react-docgen` より `react-docgen-typescript` の方が
   * union / CVA の `VariantProps` を列挙しやすい（公式の切替案内どおり）。
   * @see https://storybook.js.org/docs/configure/integration/typescript
   */
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldExtractValuesFromUnion: true,
      shouldSortUnions: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        if (prop.declarations?.length) {
          return prop.declarations.some(
            (declaration) => !declaration.fileName.includes("node_modules"),
          );
        }
        return true;
      },
    },
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "@": path.resolve(rootDir, "src"),
        },
      },
    }),
};

export default config;
