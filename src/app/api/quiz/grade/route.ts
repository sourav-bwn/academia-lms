import { NextResponse } from "next/server";

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

interface GradingQuestion {
  question: string;
  correctAnswer: string;
  userAnswer: string;
}

interface ShortAnswerResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  feedback: string;
  score: number;
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

    const prompt = `You are an expert English teacher for Indian competitive exams. You need to grade short answer questions and provide detailed feedback.

For each question, analyze:
1. Compare student's answer with the correct answer
2. Determine if the answer is correct or incorrect
3. If incorrect, explain the mistake and provide the correct answer
4. Give a score (0-100) based on accuracy

Questions to grade:
${questions
  .map(
    (q: GradingQuestion, i: number) =>
      `Q${i + 1}: ${q.question}\nCorrect Answer: ${q.correctAnswer}\nStudent Answer: ${q.userAnswer}`
  )
  .join("\n\n")}

Return ONLY a valid JSON array with objects in the same order as the questions. Each object must have:
- question: the question text
- userAnswer: what the student wrote
- correctAnswer: the correct answer
- isCorrect: true/false
- feedback: If correct, a brief positive message. If incorrect, explain what was wrong and provide the correct answer.
- score: number 0-100

Format:
[
  {"question":"...","userAnswer":"...","correctAnswer":"...","isCorrect":false,"feedback":"Your answer was incorrect because... The correct answer is...","score":50}
]`;

    const response = await fetchWithRetry(
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
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 2048,
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
    const results: ShortAnswerResult[] = JSON.parse(cleaned);

    const totalScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    );

    return NextResponse.json({ score: totalScore, results });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: "Failed to grade answers" },
      { status: 500 }
    );
  }
}