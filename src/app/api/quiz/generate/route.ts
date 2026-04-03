import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { subject, topic, questionCount = 15 } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured. Please add OPENROUTER_API_KEY to environment variables." },
        { status: 500 }
      );
    }

    const subjectContext = getSubjectContext(subject, topic);
    
    const prompt = `You are an expert teacher for Indian competitive exams (WBCS, SSC, BANK, RAILWAY) and school boards (CBSE, ICSE, West Bengal Board).
Generate exactly ${questionCount} questions on ${subjectContext}.
Each question must have:
- A clear question text
- 4 options labeled A, B, C, D (for MCQ questions)
- One correct answer (A, B, C, or D)
- A brief explanation of why that answer is correct

MIX OF QUESTION TYPES:
- First ${questionCount - 5} questions should be Multiple Choice Questions (MCQ) with 4 options
- Last 5 questions should be Short Answer questions (no options, user writes answer)

Return ONLY a valid JSON array with no markdown formatting, no code blocks, no extra text:
[
  {"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correctAnswer":"A","explanation":"...","type":"mcq"},
  {"question":"...","type":"short","correctAnswer":"..."}
]`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://academia-lms-nine.vercel.app",
          "X-Title": "ACADEMIA LMS",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI API error: ${errorData.error?.message || response.statusText}`);
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
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}

function getSubjectContext(subject: string, topic: string): string {
  const contexts: Record<string, string> = {
    grammar: `English Grammar - Topic: ${topic}`,
    gk: `General Knowledge - Topic: ${topic}`,
    history: `History - Topic: ${topic}`,
    reasoning: `Reasoning/Logical Ability - Topic: ${topic}`,
    mathematics: `Mathematics/Quantitative Aptitude - Topic: ${topic}`,
    quiz: `General Knowledge & Current Affairs - Topic: ${topic}`,
  };
  return contexts[subject] || `General Knowledge - Topic: ${topic}`;
}