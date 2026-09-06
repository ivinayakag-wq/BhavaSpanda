import { Loader2 } from "lucide-react";

export default function MessagesLoading() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gold/5 blur-3xl"
      />
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </main>
  );
}
