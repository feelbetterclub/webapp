export function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      {text}
    </div>
  );
}
