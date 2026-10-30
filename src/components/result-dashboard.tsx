"use client";

import { FileText, ListVideo, Mic2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { SceneCueList } from "@/components/scene-cue-list";
import { ScriptView } from "@/components/script-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Language, RecapScript } from "@/lib/types";

export function ResultDashboard({
  script,
  language,
}: {
  script: RecapScript;
  language: Language;
}) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Tabs defaultValue="script" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900/80">
          <TabsTrigger value="script" className="gap-1.5">
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Script</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-1.5">
            <Mic2 className="size-3.5" />
            <span className="hidden sm:inline">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="cues" className="gap-1.5">
            <ListVideo className="size-3.5" />
            <span className="hidden sm:inline">Scene cues</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script">
          <ScriptView script={script} />
        </TabsContent>
        <TabsContent value="audio">
          <AudioPlayer text={script.full_script} language={language} />
        </TabsContent>
        <TabsContent value="cues">
          <SceneCueList cues={script.scene_cues} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
