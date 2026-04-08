import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../index";

const meta = {
  component: TabsTrigger,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "general",
    children: "一般",
  },
} satisfies Meta<typeof TabsTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue={args.value} className="w-[480px]">
      <TabsList>
        <TabsTrigger {...args} />
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

export const Disabled: Story = {
  args: {
    value: "general",
    children: "一般",
    disabled: true,
  },
  render: (args) => (
    <Tabs defaultValue="search" className="w-[480px]">
      <TabsList>
        <TabsTrigger {...args} />
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
