import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import type { ServiceConfig } from "@/lib/types";
import { DataTransferSectionView } from "./index";

type DataTransferSectionViewStoryArgs = ComponentProps<typeof DataTransferSectionView>;

const demoConfigs: ServiceConfig[] = [
  {
    id: "service-demo",
    name: "デモサービス",
    urlPatterns: ["https://example.com/*"],
    observeRootSelector: "#root",
    itemSelector: ".item",
    uniqueKeyField: "title",
    fieldRules: [{ name: "title", selector: ".title", type: "text" }],
    enabled: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
];

const meta = {
  component: DataTransferSectionView,
  parameters: {
    layout: "centered",
  },
  args: {
    configs: demoConfigs,
    selectedExportServiceId: "service-demo",
    importFileName: null,
    loading: false,
    onSelectExportService: () => undefined,
    onSelectImportFile: () => undefined,
    onExport: () => undefined,
    onImport: () => undefined,
  },
} satisfies Meta<typeof DataTransferSectionView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<DataTransferSectionViewStoryArgs>();
    return (
      <DataTransferSectionView
        configs={args?.configs ?? demoConfigs}
        selectedExportServiceId={args?.selectedExportServiceId ?? "service-demo"}
        importFileName={args?.importFileName ?? null}
        loading={args?.loading ?? false}
        onSelectExportService={(serviceId) => {
          updateArgs({ selectedExportServiceId: serviceId });
        }}
        onSelectImportFile={(file) => {
          updateArgs({ importFileName: file?.name ?? null });
        }}
        onExport={() => undefined}
        onImport={() => undefined}
      />
    );
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const NoServices: Story = {
  args: {
    configs: [],
    selectedExportServiceId: "",
  },
};
