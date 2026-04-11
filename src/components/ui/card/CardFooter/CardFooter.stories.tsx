import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../button";
import { Card, CardFooter } from "../index";

const meta = {
  component: CardFooter,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "justify-end gap-2",
  },
} satisfies Meta<typeof CardFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[360px]">
      <CardFooter {...args}>
        <Button type="button" variant="outline">
          キャンセル
        </Button>
        <Button type="button">保存</Button>
      </CardFooter>
    </Card>
  ),
};
