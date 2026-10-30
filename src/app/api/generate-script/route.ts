import { NextResponse } from "next/server";
import { generateRecapScript } from "@/lib/llm";
import type { GenerateScriptRequest, Genre, Language, LengthMinutes } from "@/lib/types";

const GENRES: Genre[] = [
  "Action",
  "Thriller",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Drama",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GenerateScriptRequest>;
    const title = (body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Movie title is required." }, { status: 400 });
    }
    const genre = (GENRES.includes(body.genre as Genre)
      ? body.genre
      : "Drama") as Genre;
    const language: Language = body.language === "my" ? "my" : "en";
    const lengthMinutes: LengthMinutes =
      body.lengthMinutes === 3 ? 3 : 1;

    const result = await generateRecapScript({
      title,
      genre,
      language,
      lengthMinutes,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/generate-script]", err);
    return NextResponse.json(
      { error: "Failed to generate script." },
      { status: 500 },
    );
  }
}
