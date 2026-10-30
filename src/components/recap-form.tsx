"use client";

import { useState } from "react";
import { Clapperboard, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Genre,
  Language,
  LengthMinutes,
  RecapScript,
} from "@/lib/types";

const GENRES: Genre[] = [
  "Action",
  "Thriller",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Drama",
];

export function RecapForm({
  onGenerated,
}: {
  onGenerated: (script: RecapScript, meta: { language: Language }) => void;
}) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<Genre>("Thriller");
  const [language, setLanguage] = useState<Language>("en");
  const [lengthMinutes, setLengthMinutes] = useState<LengthMinutes>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Enter a movie title.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), genre, language, lengthMinutes }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const script = (await res.json()) as RecapScript;
      onGenerated(script, { language });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-crimson/20 bg-zinc-950/70 shadow-2xl shadow-crimson/5">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <Clapperboard className="size-4" />
            Recap studio
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Movie title</Label>
            <Input
              id="title"
              placeholder="e.g. Inception, Parasite, The Dark Knight…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select
                value={genre}
                onValueChange={(v) => setGenre(v as Genre)}
                disabled={loading}
              >
                <SelectTrigger aria-label="Genre">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Output language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as Language)}
                disabled={loading}
              >
                <SelectTrigger aria-label="Language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="my">Burmese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Video length</Label>
              <Select
                value={String(lengthMinutes)}
                onValueChange={(v) =>
                  setLengthMinutes(v === "3" ? 3 : 1)
                }
                disabled={loading}
              >
                <SelectTrigger aria-label="Video length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Minute — Shorts/TikTok</SelectItem>
                  <SelectItem value="3">3 Minutes — YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-crimson to-amber-600 text-white shadow-lg shadow-crimson/25 hover:from-crimson/90 hover:to-amber-600/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating recap…
              </>
            ) : (
              <>
                <Sparkles />
                Generate Recap
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
