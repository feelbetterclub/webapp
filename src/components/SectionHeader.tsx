export function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center mb-16">
      <p className="text-brand-teal uppercase tracking-[0.2em] text-xs font-semibold mb-3">
        {label}
      </p>
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-deep mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
