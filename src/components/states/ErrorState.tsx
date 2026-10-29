export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-red-300/20 bg-red-950/30 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div role="alert" className="min-w-0">
        <h2 className="font-semibold">Não foi possível carregar os dados</h2>
        <p className="mt-1 text-sm text-white/70">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-[filter] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        Tentar novamente
      </button>
    </section>
  );
}
