import { Field } from "@base-ui/react/field";
import type {
  FieldRootProps,
  FieldLabelProps,
  FieldErrorProps,
} from "@base-ui/react/field";

import { cn } from "~/lib/utils";

function Label({ className, ...props }: FieldLabelProps) {
  return (
    <Field.Label
      className={cn(
        "text-sm font-semibold tracking-wider uppercase",
        className
      )}
      {...props}
    />
  );
}

function FieldRoot({ className, ...props }: FieldRootProps) {
  return (
    <Field.Root className={cn("flex flex-col gap-1.5", className)} {...props} />
  );
}

function ErrorMessage({ className, ...props }: FieldErrorProps) {
  return (
    <Field.Error
      className={cn("text-xs text-destructive", className)}
      {...props}
    />
  );
}

export { Label, FieldRoot, ErrorMessage };
