import { NextResponse } from "next/server";
import { runRealNivaranAgents } from "@/lib/ai/orchestrator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const story = typeof body.story === "string" ? body.story.trim() : "";
    if (!story) return NextResponse.json({ error: "Please provide the investor's story." }, { status: 400 });
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI service is not configured. Add GEMINI_API_KEY to the server environment." }, { status: 503 });
    }
    const result = await runRealNivaranAgents(story);
    return NextResponse.json({ ok: true, case: result });
  } catch (error) {
    console.error("NIVARAN agent pipeline failed", error);
    return NextResponse.json({ error: "The AI analysis could not be completed. Please try again." }, { status: 500 });
  }
}
