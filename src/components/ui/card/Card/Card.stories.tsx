import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../index";

const meta = {
  component: Card,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>通知設定</CardTitle>
        <CardDescription>日次レポートの配信設定を変更できます。</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        配信先メールアドレスと配信時刻を保存すると、毎日自動で通知されます。
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">キャンセル</Button>
        <Button>保存</Button>
      </CardFooter>
    </Card>
  ),
};
