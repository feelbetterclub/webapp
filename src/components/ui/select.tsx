import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { inputStyles } from "./input";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-brand-deep mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(inputStyles, className)}
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
Select.displayName = "Select";

export { Select };
