import { Dialog } from "@base-ui/react/dialog";
import type {
  DialogRootProps,
  DialogTriggerProps,
  DialogBackdropProps,
  DialogPopupProps,
  DialogCloseProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "~/lib/utils";

function Root(props: DialogRootProps) {
  return <Dialog.Root {...props} />;
}

function Trigger({ className, ...props }: DialogTriggerProps) {
  return <Dialog.Trigger className={cn(className)} {...props} />;
}

function Backdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <Dialog.Backdrop
      className={cn(
        "fixed inset-0 bg-black/40 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity",
        className
      )}
      {...props}
    />
  );
}

function Popup({ className, ...props }: DialogPopupProps) {
  return (
    <Dialog.Portal>
      <Backdrop />
      <Dialog.Popup
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card p-6 shadow-lg data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 transition-all",
          className
        )}
        {...props}
      />
    </Dialog.Portal>
  );
}

function Close({ className, ...props }: DialogCloseProps) {
  return (
    <Dialog.Close
      className={cn(
        "absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      {...props}
    >
      <X className="size-4" />
    </Dialog.Close>
  );
}

function Title({ className, ...props }: DialogTitleProps) {
  return (
    <Dialog.Title
      className={cn("text-lg font-heading font-semibold", className)}
      {...props}
    />
  );
}

function Description({ className, ...props }: DialogDescriptionProps) {
  return (
    <Dialog.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Root,
  Trigger,
  Popup,
  Close,
  Title,
  Description,
};
