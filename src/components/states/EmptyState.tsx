export interface EmptyStateProps {
  title: string;
  tip: string;
}

export default function EmptyState({ title, tip }: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-labelledby="empty-state-title"
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white"
    >
      <h2 id="empty-state-title" className="font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-sm text-white/65">{tip}</p>
    </section>
  );
}
