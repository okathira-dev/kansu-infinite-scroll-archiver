import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-[480px]">
      <TabsList>
        <TabsTrigger value="general">一般</TabsTrigger>
        <TabsTrigger value="search">検索</TabsTrigger>
        <TabsTrigger value="advanced">詳細</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="rounded-md border p-4 text-sm">
        一般設定の内容です。
      </TabsContent>
      <TabsContent value="search" className="rounded-md border p-4 text-sm">
        検索設定の内容です。
      </TabsContent>
      <TabsContent value="advanced" className="rounded-md border p-4 text-sm">
        詳細設定の内容です。
      </TabsContent>
    </Tabs>
  ),
};
