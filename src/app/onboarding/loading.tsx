import { Loader2 } from "lucide-react";

export default function OnboardingLoading() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </main>
  );
}
