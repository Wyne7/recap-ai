# RecapAI — Automatic Movie Recap Script & Voice Generator

Dark cinematic Next.js app that turns a movie title into a structured recap script, stock-search scene cues, and a playable voiceover preview.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **shadcn-style** UI (Button, Input, Select, Tabs, Card, Label) + Lucide icons
- **API routes**: `/api/generate-script`, `/api/generate-voice`
- **LLM**: Groq (Llama) → OpenAI → deterministic mock (offline)
- **TTS**: free Edge-TTS (`my-MM-NilarNeural` / `en-US-JennyNeural`) → optional ElevenLabs → mock beep WAV

## Quick start

```bash
cd recap-ai
npm install

# Edge-TTS (recommended for real voiceovers; keep venv outside the Next project)
python3 -m venv ~/.venvs/recap-ai
~/.venvs/recap-ai/bin/pip install edge-tts
# optional override:
# export RECAPAI_PYTHON=~/.venvs/recap-ai/bin/python

cp .env.example .env.local   # optional API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production:

```bash
npm run build
npm start
```

## Environment variables

See `.env.example`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | No | Preferred LLM for scripts |
| `OPENAI_API_KEY` | No | Fallback LLM |
| `ELEVENLABS_API_KEY` | No | Fallback TTS if Edge-TTS fails |
| `ELEVENLABS_VOICE_ID` | No | ElevenLabs voice id |

Without keys the app still works: scripts come from the **mock** generator; voice uses **Edge-TTS** if `.venv` is installed, otherwise a short mock beep.

## Features

1. Hero + form (title, genre, Burmese/English, 1 or 3 minute length)
2. **Script** tab with copy button and amber-highlighted `[Visual: …]` tags
3. **Audio** tab with custom player (Edge-TTS MP3 when available)
4. **Scene cues** with timestamps + stock search tags

## Project layout

```
src/app/api/generate-script/route.ts
src/app/api/generate-voice/route.ts
src/components/…          # UI + dashboard
src/lib/llm.ts            # Groq / OpenAI / mock
src/lib/mock-script.ts
scripts/tts.py            # Edge-TTS CLI wrapper
```

## Notes

- Narration is original recap-style paraphrasing — not verbatim copyrighted dialogue.
- Do not commit real API keys. Leave blanks in `.env.example`.
