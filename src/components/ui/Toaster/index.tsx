import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { type ExternalToast, Toaster as Sonner, type ToasterProps, toast } from "sonner";

/** 汎用トースト UI（`sonner` のラッパー）。 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export interface NotifyOptions extends Omit<ExternalToast, "description"> {
  description?: ReactNode;
}

/** 成功トーストを表示する。 */
export const notifySuccess = (message: ReactNode, options?: NotifyOptions) =>
  toast.success(message, options);

/** 情報トーストを表示する。 */
export const notifyInfo = (message: ReactNode, options?: NotifyOptions) =>
  toast.info(message, options);

/** 警告トーストを表示する。 */
export const notifyWarning = (message: ReactNode, options?: NotifyOptions) =>
  toast.warning(message, options);

/** エラートーストを表示する。 */
export const notifyError = (message: ReactNode, options?: NotifyOptions) =>
  toast.error(message, options);

export { Toaster };
