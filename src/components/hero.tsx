import { Film } from "lucide-react";

export function Hero() {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-crimson/30 px-6 py-12 sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-200/90">
          <Film className="size-3.5" />
          RecapAI
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Turn Any Movie Name into a Thrilling Recap Script &amp; Voiceover
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-zinc-300 sm:text-lg">
          Generate hook-driven narration, visual stock-search cues, and a
          playable voice preview — built for Shorts, TikTok, and YouTube.
        </p>
      </div>
    </header>
  );
}
