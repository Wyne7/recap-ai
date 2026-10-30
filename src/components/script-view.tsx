"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecapScript } from "@/lib/types";

function highlightVisuals(text: string) {
  const parts = text.split(/(\[Visual:[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("[Visual:") && part.endsWith("]")) {
      return (
        <mark
          key={i}
          className="rounded-md bg-accent/20 px-1.5 py-0.5 font-medium text-accent not-italic"
        >
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ScriptView({ script }: { script: RecapScript }) {
  const [copied, setCopied] = useState(false);
  const combined = useMemo(
    () =>
      [
        `HOOK\n${script.hook}`,
        `PLOT\n${script.plot_summary}`,
        `OUTRO\n${script.outro}`,
      ].join("\n\n"),
    [script],
  );

  async function copyAll() {
    await navigator.clipboard.writeText(combined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Provider:{" "}
          <span className="font-medium text-foreground">
            {script.provider ?? "mock"}
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={copyAll}>
          {copied ? <Check className="text-emerald-400" /> : <Copy />}
          {copied ? "Copied" : "Copy script"}
        </Button>
      </div>

      {(
        [
          ["Hook", script.hook],
          ["Plot summary", script.plot_summary],
          ["Outro", script.outro],
        ] as const
      ).map(([label, body]) => (
        <Card key={label} className="border-white/5 bg-black/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-200/90">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-200">
              {highlightVisuals(body)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
