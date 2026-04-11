import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../index";

const meta = {
  component: TabsList,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof TabsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue="general" className="w-[480px]">
      <TabsList {...args}>
        <TabsTrigger value="general">一般</TabsTrigger>
        <TabsTrigger value="search">検索</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="rounded-md border p-4 text-sm">
        一般設定の内容です。
      </TabsContent>
      <TabsContent value="search" className="rounded-md border p-4 text-sm">
        検索設定の内容です。
      </TabsContent>
    </Tabs>
  ),
};

export const Line: Story = {
  args: {
    variant: "line",
  },
  render: (args) => (
    <Tabs defaultValue="general" className="w-[480px]" orientation="horizontal">
      <TabsList {...args}>
        <TabsTrigger value="general">一般</TabsTrigger>
        <TabsTrigger value="search">検索</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="rounded-md border p-4 text-sm">
        一般設定の内容です。
      </TabsContent>
      <TabsContent value="search" className="rounded-md border p-4 text-sm">
        検索設定の内容です。
      </TabsContent>
    </Tabs>
  ),
};
