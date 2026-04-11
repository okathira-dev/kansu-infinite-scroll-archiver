import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardDescription, CardHeader, CardTitle } from "../index";

const meta = {
  component: CardHeader,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "gap-2",
  },
} satisfies Meta<typeof CardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[360px]">
      <CardHeader {...args}>
        <CardTitle>通知設定</CardTitle>
        <CardDescription>日次レポートの配信設定を変更できます。</CardDescription>
      </CardHeader>
    </Card>
  ),
};
