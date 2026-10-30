#!/usr/bin/env python3
"""Generate MP3 via free Microsoft Edge TTS (edge-tts). No API key.

Usage:
  .venv/bin/python scripts/tts.py --text "Hello" --voice en-US-JennyNeural --out /tmp/out.mp3
"""
from __future__ import annotations

import argparse
import asyncio
import sys


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--voice", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--rate", default="-5%")
    args = parser.parse_args()

    try:
        import edge_tts
    except ImportError:
        print("edge-tts not installed", file=sys.stderr)
        return 2

    text = args.text.strip()
    if not text:
        print("empty text", file=sys.stderr)
        return 1

    # Cap runaway payloads for serverless safety
    if len(text) > 8000:
        text = text[:8000]

    await edge_tts.Communicate(text, args.voice, rate=args.rate).save(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
