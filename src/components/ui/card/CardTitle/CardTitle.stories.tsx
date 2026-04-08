import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardHeader, CardTitle } from "../index";

const meta = {
  component: CardTitle,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "カードタイトル",
    className: "text-base",
  },
} satisfies Meta<typeof CardTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle {...args} />
      </CardHeader>
    </Card>
  ),
};
