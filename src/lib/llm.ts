import { buildMockScript } from "@/lib/mock-script";
import type { GenerateScriptRequest, RecapScript, SceneCue } from "@/lib/types";

function buildPrompt(req: GenerateScriptRequest): string {
  const lang =
    req.language === "my"
      ? "Burmese (Myanmar script). Write natural spoken Burmese narration."
      : "English";
  const duration =
    req.lengthMinutes === 1
      ? "about 140–170 words (1-minute Shorts/TikTok)"
      : "about 400–500 words (3-minute YouTube)";

  return `You are a viral movie-recap YouTuber. Write an ORIGINAL recap-style narration for the film "${req.title}" (${req.genre}).

Rules:
- Language: ${lang}
- Target length: ${duration}
- Do NOT copy copyrighted dialogue or scripts verbatim. Paraphrase plot in your own words.
- Include many [Visual: ...] tags inside plot_summary (stock-footage search phrases in English even if narration is Burmese).
- Return ONLY valid JSON with keys:
  hook (string — first ~10 seconds suspenseful intro),
  plot_summary (string — step-by-step recap with [Visual: ...] cues),
  outro (string — cliffhanger + CTA),
  full_script (string — hook + plot narration WITHOUT visual tags + outro, ready for TTS),
  scene_cues (array of { timestamp: "M:SS", tag: string, narration_excerpt: string })

Timestamps should span 0:00 to roughly ${req.lengthMinutes}:00.`;
}

function parseJsonPayload(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  return JSON.parse(raw);
}

function normalize(data: unknown, fallback: RecapScript): RecapScript {
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  const hook = typeof d.hook === "string" ? d.hook : fallback.hook;
  const plot_summary =
    typeof d.plot_summary === "string" ? d.plot_summary : fallback.plot_summary;
  const outro = typeof d.outro === "string" ? d.outro : fallback.outro;
  let full_script =
    typeof d.full_script === "string" ? d.full_script : fallback.full_script;
  if (!full_script.trim()) {
    full_script = [hook, plot_summary.replace(/\[Visual:[^\]]+\]\s*/g, ""), outro]
      .join(" ")
      .trim();
  }
  let scene_cues: SceneCue[] = fallback.scene_cues;
  if (Array.isArray(d.scene_cues)) {
    const parsed = d.scene_cues
      .map((c) => {
        if (!c || typeof c !== "object") return null;
        const o = c as Record<string, unknown>;
        if (
          typeof o.timestamp !== "string" ||
          typeof o.tag !== "string" ||
          typeof o.narration_excerpt !== "string"
        ) {
          return null;
        }
        return {
          timestamp: o.timestamp,
          tag: o.tag,
          narration_excerpt: o.narration_excerpt,
        };
      })
      .filter(Boolean) as SceneCue[];
    if (parsed.length) scene_cues = parsed;
  }
  return { hook, plot_summary, outro, full_script, scene_cues };
}

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("no groq key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write original movie recap narration as JSON only. Never invent API keys.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty Groq response");
  return content;
}

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("no openai key");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write original movie recap narration as JSON only. Never invent API keys.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty OpenAI response");
  return content;
}

export async function generateRecapScript(
  req: GenerateScriptRequest,
): Promise<RecapScript> {
  const mock = buildMockScript(req);
  const prompt = buildPrompt(req);

  if (process.env.GROQ_API_KEY) {
    try {
      const raw = await callGroq(prompt);
      const normalized = normalize(parseJsonPayload(raw), mock);
      return { ...normalized, provider: "groq" };
    } catch (err) {
      console.error("[generate-script] Groq failed, falling back:", err);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const raw = await callOpenAI(prompt);
      const normalized = normalize(parseJsonPayload(raw), mock);
      return { ...normalized, provider: "openai" };
    } catch (err) {
      console.error("[generate-script] OpenAI failed, falling back:", err);
    }
  }

  return mock;
}
