import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "AI API key not configured. Please contact admin." }, { status: 500 });
  }

  try {
    const { subject, topic, questionCount = 10 } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const subjectContext = getSubjectContext(subject, topic);
    const mcqCount = Math.max(0, questionCount - 3);
    
    const prompt = `Generate ${questionCount} questions on ${subjectContext}.
First ${mcqCount} are MCQ: question, options A/B/C/D, correct answer (letter), explanation.
Last 3 are short answer: question, correct answer only.
Format as JSON array.`;

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
        max_tokens: 1200,
      }),
    });

    if (response.status === 429) {
      return NextResponse.json({ error: "Rate limited. Please wait a moment and try again." }, { status: 429 });
    }

    if (!response.ok) {
      return NextResponse.json({ error: "AI service unavailable. Please try again." }, { status: 503 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json({ error: "AI returned empty response. Please try again." }, { status: 500 });
    }

    // Clean the response
    let cleaned = text;
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "").replace(/```/g, "");
    cleaned = cleaned.trim();

    // Find JSON array
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1) {
      // No JSON array found, try to parse anyway
      const questions = JSON.parse(cleaned);
      return NextResponse.json({ questions });
    }

    const jsonStr = cleaned.substring(startIdx, endIdx + 1);
    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions generated. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Quiz generation error:", message);
    return NextResponse.json({ error: "Failed to generate. Please try again." }, { status: 500 });
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