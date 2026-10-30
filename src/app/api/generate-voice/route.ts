import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";


type Body = {
  text?: string;
  language?: "en" | "my";
};

function resolvePython(): string {
  if (process.env.RECAPAI_PYTHON) return process.env.RECAPAI_PYTHON;
  // Prefer an out-of-tree venv (avoids Turbopack resolving project .venv symlinks)
  const home = process.env.HOME || os.homedir();
  const external = path.join(home, ".venvs", "recap-ai", "bin", "python");
  return external;
}

function runEdgeTts(text: string, voice: string, outFile: string): Promise<void> {
  const python = resolvePython();
  const script = path.join(process.cwd(), "scripts", "tts.py");
  return new Promise((resolve, reject) => {
    const child = spawn(/*turbopackIgnore: true*/ python, [script, "--text", text, "--voice", voice, "--out", outFile], {
      env: process.env,
    });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `edge-tts exited ${code}`));
    });
  });
}

/** Minimal valid silent-ish WAV (0.4s) when Edge-TTS is unavailable. */
function mockWavBuffer(): Buffer {
  const sampleRate = 22050;
  const durationSec = 0.4;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  // soft sine beep so the player is audibly "working"
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.15 * Math.sin(Math.PI * t / durationSec);
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }
  return buffer;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const text = (body.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const language = body.language === "my" ? "my" : "en";
    const voice =
      language === "my" ? "my-MM-NilarNeural" : "en-US-JennyNeural";

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "recapai-tts-"));
    const outFile = path.join(tmpDir, `${randomUUID()}.mp3`);

    try {
      await runEdgeTts(text, voice, outFile);
      const mp3 = await fs.readFile(outFile);
      return new NextResponse(new Uint8Array(mp3), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
          "X-RecapAI-TTS": "edge-tts",
          "X-RecapAI-Voice": voice,
        },
      });
    } catch (err) {
      console.warn("[generate-voice] Edge-TTS unavailable, using mock audio:", err);

      // Optional future ElevenLabs path documented via env — do not invent keys
      if (process.env.ELEVENLABS_API_KEY) {
        try {
          const voiceId =
            process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
              method: "POST",
              headers: {
                "xi-api-key": process.env.ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
                Accept: "audio/mpeg",
              },
              body: JSON.stringify({
                text: text.slice(0, 2500),
                model_id: "eleven_multilingual_v2",
              }),
            },
          );
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            return new NextResponse(new Uint8Array(buf), {
              status: 200,
              headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-store",
                "X-RecapAI-TTS": "elevenlabs",
              },
            });
          }
        } catch (e) {
          console.warn("[generate-voice] ElevenLabs failed:", e);
        }
      }

      const wav = mockWavBuffer();
      return new NextResponse(new Uint8Array(wav), {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Cache-Control": "no-store",
          "X-RecapAI-TTS": "mock",
          "X-RecapAI-Mock-Message":
            "Edge-TTS unavailable. Returned short mock beep. Install .venv edge-tts or set ELEVENLABS_API_KEY.",
        },
      });
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  } catch (err) {
    console.error("[api/generate-voice]", err);
    return NextResponse.json(
      { error: "Failed to generate voiceover.", mock: true },
      { status: 500 },
    );
  }
}
