import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

const inputStyles =
  "w-full px-4 py-3 rounded-xl border border-brand-cream bg-brand-light/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
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
      <input ref={ref} id={id} className={cn(inputStyles, className)} {...props} />
    </div>
  )
);
Input.displayName = "Input";

export { Input, inputStyles };
