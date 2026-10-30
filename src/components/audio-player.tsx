"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Language } from "@/lib/types";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  text,
  language,
}: {
  text: string;
  language: Language;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPlaying(false);
      setUrl(null);
      setProvider(null);
      try {
        const res = await fetch("/api/generate-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language }),
        });
        if (!res.ok) {
          throw new Error(`Voice API ${res.status}`);
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        revoked = objectUrl;
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setUrl(objectUrl);
        setProvider(res.headers.get("X-RecapAI-TTS"));
        const mockMsg = res.headers.get("X-RecapAI-Mock-Message");
        if (mockMsg) setError(mockMsg);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Could not generate voiceover. Script still available.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [text, language]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <Card className="border-white/5 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-amber-200/90">
          <Volume2 className="size-4" />
          Voiceover preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Generating narration audio…
          </div>
        )}

        {url && (
          <>
            <audio
              ref={audioRef}
              src={url}
              preload="metadata"
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
            />
            <div className="flex items-center gap-3">
              <Button size="icon" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause /> : <Play />}
              </Button>
              <div className="min-w-0 flex-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.01}
                  value={current}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setCurrent(v);
                    if (audioRef.current) audioRef.current.currentTime = v;
                  }}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-amber-400"
                />
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>{formatTime(current)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
            {provider && (
              <p className="text-xs text-zinc-500">
                Engine: <span className="text-zinc-300">{provider}</span>
                {provider === "edge-tts" && " · free Microsoft Edge neural voice"}
                {provider === "mock" && " · short placeholder beep (install edge-tts for real voice)"}
              </p>
            )}
          </>
        )}

        {error && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
