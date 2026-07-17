import { cn } from "~/lib/utils";
import { Button } from "./button";

interface SessionToastProps {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function SessionToast({
  message,
  onAction,
  actionLabel = "Stay logged in",
  className,
}: SessionToastProps) {
  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-none border border-border bg-card p-4 shadow-lg animate-in slide-in-from-bottom-4",
        className
      )}
    >
      <p className="text-sm text-foreground">{message}</p>
      {onAction && (
        <Button variant="outline" size="xs" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
