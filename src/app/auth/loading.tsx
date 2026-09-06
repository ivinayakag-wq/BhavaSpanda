import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </main>
  );
}
