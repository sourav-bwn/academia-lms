import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

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
Rules: First ${mcqCount} MCQ (A,B,C,D + answer + explanation), last 3 short answer (no options + correct answer).
Return ONLY JSON array: [{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correctAnswer":"A","explanation":"...","type":"mcq"},{"question":"...","type":"short","correctAnswer":"..."}]`;

    // Try up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

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
          if (attempt === 1) {
            return NextResponse.json({ error: `AI service temporarily unavailable. Please try again.` }, { status: 503 });
          }
          continue;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
          if (attempt === 1) {
            return NextResponse.json({ error: "AI returned empty response. Please try again." }, { status: 500 });
          }
          continue;
        }

        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const questions = JSON.parse(cleaned);

        if (!Array.isArray(questions) || questions.length === 0) {
          if (attempt === 1) {
            return NextResponse.json({ error: "Invalid questions format. Please try again." }, { status: 500 });
          }
          continue;
        }

        return NextResponse.json({ questions });
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
        if (attempt === 1) {
          return NextResponse.json({ error: "Connection timeout. Please try again." }, { status: 504 });
        }
      }
    }

    return NextResponse.json({ error: "Failed to generate questions. Please try again." }, { status: 500 });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
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