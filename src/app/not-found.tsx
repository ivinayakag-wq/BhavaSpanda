import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "#FAFAF8" }}>
      <span className="text-6xl">🕉️</span>
      <h1 className="font-name text-3xl font-bold" style={{ color: "#1A1A1A" }}>Page not found</h1>
      <p className="max-w-sm text-sm" style={{ color: "#8A8A8A" }}>
        This path doesn&apos;t exist on this plane. Maybe the universe has a different route for you.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full px-6 py-3 text-sm font-bold text-white transition-all"
        style={{ background: "#EC4899" }}
      >
        Return to the path
      </Link>
    </div>
  );
}
