import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../index";

const meta = {
  component: TabsContent,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "general",
    children: "一般設定の内容です。",
  },
} satisfies Meta<typeof TabsContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue={args.value} className="w-[480px]">
      <TabsList>
        <TabsTrigger value="general">一般</TabsTrigger>
        <TabsTrigger value="search">検索</TabsTrigger>
      </TabsList>
      <TabsContent {...args} className="rounded-md border p-4 text-sm" />
      <TabsContent value="search" className="rounded-md border p-4 text-sm">
        検索設定の内容です。
      </TabsContent>
    </Tabs>
  ),
};
