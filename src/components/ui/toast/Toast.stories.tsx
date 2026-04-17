import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Button } from "../button";
import { Toaster } from "./index";

const meta = {
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  args: {
    richColors: true,
    closeButton: true,
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** プリセット `Toaster` の見た目と主要 props を Controls で触れる。 */
export const ToasterControls: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success("保存しました")}>Success</Button>
        <Button variant="secondary" onClick={() => toast.info("情報メッセージです")}>
          Info
        </Button>
        <Button variant="destructive" onClick={() => toast.error("エラーが発生しました")}>
          Error
        </Button>
      </div>
    </div>
  ),
};
