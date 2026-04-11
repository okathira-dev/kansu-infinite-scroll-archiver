import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Button } from "../button";
import { Toaster } from "./index";

const meta = {
  component: Toaster,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    richColors: true,
    closeButton: true,
  },
  render: (args) => (
    <div className="flex gap-2">
      <Toaster {...args} />
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
