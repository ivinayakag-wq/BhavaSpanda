"use client";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-red/10 blur-3xl"
      />
      <h2 className="font-name text-2xl text-white">Setup interrupted</h2>
      <p className="max-w-sm text-center text-sm text-muted">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-full bg-gold px-6 py-2 text-sm font-semibold text-bg transition-colors hover:bg-gold/90"
      >
        Try again
      </button>
    </main>
  );
}
