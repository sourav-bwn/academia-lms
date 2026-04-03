import { NextResponse } from "next/server";

interface GradingQuestion {
  question: string;
  correctAnswer: string;
  userAnswer: string;
}

export async function POST(request: Request) {
  try {
    const { questions } = await request.json();

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Questions array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are an English teacher grading student answers. Evaluate each answer and give a score (0-100) based on accuracy and relevance.
    
Questions and answers to grade:
${questions
  .map(
    (q: GradingQuestion, i: number) =>
      `Q${i + 1}: ${q.question}\nCorrect Answer: ${q.correctAnswer}\nStudent Answer: ${q.userAnswer}`
  )
  .join("\n\n")}

Return ONLY a valid JSON array with scores in the same order as the questions:
[85, 70, 90] (one score per question)`;

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
          temperature: 0.3,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Grading API error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from grading API");
    }

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const scores = JSON.parse(cleaned);

    const averageScore = Math.round(
      scores.reduce((a: number, b: number) => a + b, 0) / scores.length
    );

    return NextResponse.json({ score: averageScore, scores });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: "Failed to grade answers" },
      { status: 500 }
    );
  }
}