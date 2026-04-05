import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Button } from "./button";
import { Toaster } from "./sonner";

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster richColors closeButton />
      <Button onClick={() => toast.success("保存しました")}>Success</Button>
      <Button variant="secondary" onClick={() => toast.info("情報メッセージです")}>
        Info
      </Button>
      <Button variant="destructive" onClick={() => toast.error("エラーが発生しました")}>
        Error
      </Button>
    </div>
  ),
};
