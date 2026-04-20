import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../button";
import { Card, CardAction, CardHeader, CardTitle } from "../index";

const meta = {
  component: CardAction,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
    children: (
      <Button size="sm" type="button" variant="outline">
        編集
      </Button>
    ),
  },
} satisfies Meta<typeof CardAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle className="text-base">設定</CardTitle>
        <CardAction {...args}>{args.children}</CardAction>
      </CardHeader>
    </Card>
  ),
};
