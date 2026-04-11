const variants = {
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
} as const;

type Variant = keyof typeof variants;

export function StatusBadge({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
