"use client";

import { Clock, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SceneCue } from "@/lib/types";

export function SceneCueList({ cues }: { cues: SceneCue[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Use these stock-search tags to find B-roll clips that match each beat.
      </p>
      <ul className="space-y-3">
        {cues.map((cue) => (
          <li key={`${cue.timestamp}-${cue.tag}`}>
            <Card className="border-white/5 bg-black/40">
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300">
                  <Clock className="size-3.5" />
                  {cue.timestamp}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-200">
                    <Search className="size-3.5 opacity-70" />
                    <span>&ldquo;{cue.tag}&rdquo;</span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {cue.narration_excerpt}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
