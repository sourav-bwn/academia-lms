import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { questions } = await request.json();

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Questions array is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const prompt = `Grade these ${questions.length} short answers. For each: determine correct/incorrect, explain mistakes if wrong, give score 0-100.
Return JSON: [{"question":"Q","userAnswer":"A","correctAnswer":"CA","isCorrect":false,"feedback":"explanation","score":50}]`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://academia-lms-nine.vercel.app",
        "X-Title": "ACADEMIA LMS",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-nano-30b-a3b:free",
        messages: [
          { role: "system", content: questions.map((q) => 
            `Q: ${q.question}\nCorrect: ${q.correctAnswer}\nAnswer: ${q.userAnswer}`).join("\n\n")
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Grading API error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from grading API");
    }

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const results = JSON.parse(cleaned) as { score: number }[];

    const totalScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

    return NextResponse.json({ score: totalScore, results });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json({ error: "Failed to grade answers" }, { status: 500 });
  }
}