import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { inputStyles } from "./input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-brand-deep mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(inputStyles, "resize-none", className)}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
