import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardDescription, CardHeader, CardTitle } from "../index";

const meta = {
  component: CardDescription,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "補足説明のテキストです。Controls で文言や className を変えられます。",
  },
} satisfies Meta<typeof CardDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle className="text-base">見出し</CardTitle>
        <CardDescription {...args} />
      </CardHeader>
    </Card>
  ),
};
