export function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-brand-cream p-12 text-center text-muted-foreground">
      {text}
    </div>
  );
}
