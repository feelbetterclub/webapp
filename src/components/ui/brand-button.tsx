import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-brand-teal text-brand-cream hover:bg-brand-dark",
  secondary:
    "bg-brand-sage/20 text-brand-deep hover:bg-brand-sage/30",
  outline:
    "border border-brand-sage/30 bg-white text-brand-deep hover:bg-brand-sage/10",
  danger:
    "bg-red-50 text-red-600 hover:bg-red-100",
  ghost:
    "text-brand-teal hover:text-brand-dark hover:bg-brand-sage/10",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-sm gap-2",
  xl: "px-8 py-3.5 text-base gap-2",
  full: "w-full py-3.5 text-base",
  icon: "p-1.5",
} as const;

interface BrandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
BrandButton.displayName = "BrandButton";

export { BrandButton };
