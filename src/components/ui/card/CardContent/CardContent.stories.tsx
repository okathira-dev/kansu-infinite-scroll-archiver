import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent } from "../index";

const meta = {
  component: CardContent,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "カード本文エリアです。padding や className は Controls から調整できます。",
    className: "text-sm text-muted-foreground",
  },
} satisfies Meta<typeof CardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[360px]">
      <CardContent {...args} />
    </Card>
  ),
};
