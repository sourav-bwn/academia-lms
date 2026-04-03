import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { subject, topic, questionCount = 10 } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const subjectContext = getSubjectContext(subject, topic);
    const mcqCount = Math.max(0, questionCount - 3);
    
    const prompt = `Generate ${questionCount} questions on ${subjectContext}. 
Rules: First ${mcqCount} MCQ (A,B,C,D + answer + explanation), last 3 short answer (no options + correct answer).
Return ONLY JSON array: [{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correctAnswer":"A","explanation":"...","type":"mcq"},{"question":"...","type":"short","correctAnswer":"..."}]`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

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
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from AI");
    }

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questions = JSON.parse(cleaned);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Failed to generate quiz. Please try again." }, { status: 500 });
  }
}

function getSubjectContext(subject: string, topic: string): string {
  const contexts: Record<string, string> = {
    grammar: `English Grammar - ${topic}`,
    gk: `General Knowledge - ${topic}`,
    history: `History - ${topic}`,
    reasoning: `Reasoning - ${topic}`,
    mathematics: `Mathematics - ${topic}`,
    quiz: `General Knowledge - ${topic}`,
  };
  return contexts[subject] || `General Knowledge - ${topic}`;
}