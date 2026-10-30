import type {
  GenerateScriptRequest,
  RecapScript,
  SceneCue,
} from "@/lib/types";

const GENRE_FLAVOR: Record<string, { atmosphere: string; stakes: string }> = {
  Action: {
    atmosphere: "neon rain and roaring engines",
    stakes: "one last chance to stop the countdown",
  },
  Thriller: {
    atmosphere: "whispered secrets and locked doors",
    stakes: "the truth that could ruin everyone involved",
  },
  Horror: {
    atmosphere: "flickering lights and something watching from the dark",
    stakes: "surviving until dawn",
  },
  "Sci-Fi": {
    atmosphere: "cold starlight and humming reactors",
    stakes: "rewriting the fate of a dying colony",
  },
  Romance: {
    atmosphere: "golden hour streets and unfinished letters",
    stakes: "choosing love before the train leaves",
  },
  Drama: {
    atmosphere: "quiet rooms heavy with unspoken history",
    stakes: "facing the choice that defines a life",
  },
};

function formatTimestamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildEnglish(req: GenerateScriptRequest): RecapScript {
  const { title, genre, lengthMinutes } = req;
  const flavor = GENRE_FLAVOR[genre] ?? GENRE_FLAVOR.Drama;
  const sceneCount = lengthMinutes === 1 ? 5 : 9;
  const step = Math.floor((lengthMinutes * 60) / sceneCount);

  const visualTags = [
    "dark alley at night",
    "rain-soaked city skyline",
    "close-up of trembling hands",
    "abandoned warehouse interior",
    "car chase through neon streets",
    "silhouette against a burning sunset",
    "crowded train station farewell",
    "locked diary under a desk lamp",
    "storm over a lonely lighthouse",
  ].slice(0, sceneCount);

  const beatLines = visualTags.map((tag, i) => {
    const n = i + 1;
    if (i === 0) {
      return `[Visual: ${tag}] We meet the world of ${title} — ${flavor.atmosphere}. Everything feels one breath from collapse.`;
    }
    if (i === sceneCount - 1) {
      return `[Visual: ${tag}] The final reveal lands. ${flavor.stakes} hangs in the air — and nothing will ever be the same.`;
    }
    return `[Visual: ${tag}] Beat ${n}: alliances shift, a secret slips, and the pressure of ${genre.toLowerCase()} storytelling tightens around our lead.`;
  });

  const hook = `In the world of ${title}, nothing is what it seems. Tonight, we break down the ${genre.toLowerCase()} masterpiece that had everyone holding their breath — stay with me.`;

  const plot_summary = beatLines.join("\n\n");

  const outro =
    lengthMinutes === 1
      ? `That is the pulse of ${title} in sixty seconds. Hit like if this gave you chills, follow for the next recap, and tell me which film we should tear apart next.`
      : `That is the full arc of ${title} — twist, tension, and the ending you will argue about. Like, subscribe, and drop your theory in the comments. Next recap drops soon.`;

  const full_script = [hook, ...beatLines.map((l) => l.replace(/\[Visual:[^\]]+\]\s*/g, "")), outro].join(
    " ",
  );

  const scene_cues: SceneCue[] = visualTags.map((tag, i) => ({
    timestamp: formatTimestamp(i * step),
    tag,
    narration_excerpt: beatLines[i].replace(/\[Visual:[^\]]+\]\s*/, "").slice(0, 120),
  }));

  return {
    hook,
    plot_summary,
    outro,
    full_script,
    scene_cues,
    provider: "mock",
  };
}

function buildBurmese(req: GenerateScriptRequest): RecapScript {
  const { title, genre, lengthMinutes } = req;
  const sceneCount = lengthMinutes === 1 ? 5 : 9;
  const step = Math.floor((lengthMinutes * 60) / sceneCount);

  const visualTags = [
    "ညအချိန် လမ်းကျဉ်းမှောင်",
    "မိုးရွာနေသော မြို့မိုးကောင်းကင်",
    "တုန်နေသော လက်အနီးကပ်",
    "စွန့်ပစ်ထားသော ဂိုဒေါင်အတွင်း",
    "နီယွန်လမ်းများပေါ် ကားလိုက်ဖမ်း",
    "နေဝင်ရောင်နောက်ခံ အရိပ်ပုံ",
    "ရထားဘူတာ ခွဲခွာခန်း",
    "မီးအိမ်အောက် သော့ခတ်ဒိုင်ယာရီ",
    "တစ်ကိုယ်တည်း မီးပြတိုက်မုန်တိုင်း",
  ].slice(0, sceneCount);

  const enTags = [
    "dark alley at night",
    "rain-soaked city skyline",
    "close-up of trembling hands",
    "abandoned warehouse interior",
    "car chase through neon streets",
    "silhouette against a burning sunset",
    "crowded train station farewell",
    "locked diary under a desk lamp",
    "storm over a lonely lighthouse",
  ].slice(0, sceneCount);

  const beatLines = visualTags.map((tag, i) => {
    if (i === 0) {
      return `[Visual: ${tag}] ${title} ရဲ့ ကမ္ဘာထဲ ဝင်ရောက်ကြမယ်။ ${genre} ဇာတ်လမ်းရဲ့ တင်းမာမှုတွေ စတင်နေပြီ။`;
    }
    if (i === sceneCount - 1) {
      return `[Visual: ${tag}] နောက်ဆုံး ထုတ်ဖော်ချက် ရောက်လာပြီ။ ဘာမှ အရင်လို ဖြစ်တော့မှာ မဟုတ်ဘူး။`;
    }
    return `[Visual: ${tag}] အပိုင်း ${i + 1} — လျှို့ဝှက်ချက် ပေါ်လာပြီး ဇာတ်ကောင်တွေရဲ့ ရွေးချယ်မှုတွေ ပြောင်းသွားတယ်။`;
  });

  const hook = `${title} ဆိုတဲ့ ${genre} ရုပ်ရှင်မှာ ဘာမှ မြင်ရသလို မဟုတ်ဘူး။ ဒီည ကျွန်တော်တို့ အတူ ဇာတ်လမ်းကို ခွဲခြမ်းစိတ်ဖြာကြမယ် — ဆက်ကြည့်ပါ။`;

  const plot_summary = beatLines.join("\n\n");

  const outro =
    lengthMinutes === 1
      ? `${title} ရဲ့ တစ်မိနစ် စာချုပ်ပါပဲ။ ကြိုက်ရင် Like လုပ်၊ Follow လုပ်ပြီး နောက်တစ်ကား ဘယ်ဟာ လုပ်ရမလဲ ပြောပါ။`
      : `${title} ရဲ့ အပြည့်အစုံ ဇာတ်လမ်း ဒီမှာပါ။ Like၊ Subscribe လုပ်ပြီး သင့်ရဲ့ သီအိုရီကို Comment မှာ ရေးခဲ့ပါ။`;

  const full_script = [hook, ...beatLines.map((l) => l.replace(/\[Visual:[^\]]+\]\s*/g, "")), outro].join(
    " ",
  );

  const scene_cues: SceneCue[] = enTags.map((tag, i) => ({
    timestamp: formatTimestamp(i * step),
    tag,
    narration_excerpt: beatLines[i].replace(/\[Visual:[^\]]+\]\s*/, "").slice(0, 120),
  }));

  return {
    hook,
    plot_summary,
    outro,
    full_script,
    scene_cues,
    provider: "mock",
  };
}

/** Deterministic high-quality mock so the UI works offline without API keys. */
export function buildMockScript(req: GenerateScriptRequest): RecapScript {
  return req.language === "my" ? buildBurmese(req) : buildEnglish(req);
}
