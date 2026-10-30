"use client";

import { useState } from "react";
import { Hero } from "@/components/hero";
import { RecapForm } from "@/components/recap-form";
import { ResultDashboard } from "@/components/result-dashboard";
import type { Language, RecapScript } from "@/lib/types";

export function RecapApp() {
  const [script, setScript] = useState<RecapScript | null>(null);
  const [language, setLanguage] = useState<Language>("en");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <Hero />
      <RecapForm
        onGenerated={(s, meta) => {
          setScript(s);
          setLanguage(meta.language);
        }}
      />
      {script && <ResultDashboard script={script} language={language} />}
      <footer className="pb-8 text-center text-xs text-zinc-600">
        RecapAI · Original recap-style narration · Works offline with mock LLM
      </footer>
    </div>
  );
}
