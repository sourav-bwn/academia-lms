"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  SUBJECTS,
  TEST_CONFIGS,
  SubjectId,
  Chapter,
} from "@/constants/test";
import {
  BookOpen,
  Clock,
  Brain,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trophy,
  Star,
  Target,
  Zap,
  ArrowLeft,
  Settings,
  Sparkles,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
  type: "mcq" | "short";
}

interface GeneratedQuestion {
  question: string;
  options?: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
}

interface ShortAnswerResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  feedback: string;
}

interface TestState {
  subject: SubjectId | null;
  chapter: Chapter | null;
  configId: string | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  shortAnswers: Record<string, string>;
  timeRemaining: number;
  isActive: boolean;
  isComplete: boolean;
  results: {
    score: number;
    totalQuestions: number;
    mcqCorrect: number;
    shortAnswerScore: number;
    xpEarned: number;
    shortAnswerResults?: ShortAnswerResult[];
  } | null;
}

const initialState: TestState = {
  subject: null,
  chapter: null,
  configId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  shortAnswers: {},
  timeRemaining: 0,
  isActive: false,
  isComplete: false,
  results: null,
};

export default function TestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<TestState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isActive && state.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    } else if (state.timeRemaining === 0 && state.isActive) {
      handleSubmitTest();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isActive, state.timeRemaining]);

  const generateQuestions = async () => {
    if (!state.subject || !state.chapter || !state.configId) return;

    setIsLoading(true);
    setError(null);

    try {
      const config = TEST_CONFIGS.find((c) => c.id === state.configId);

      console.log("Generating questions for:", state.subject, state.chapter, "count:", config?.questions);

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: state.subject,
          topic: state.chapter,
          questionCount: config?.questions || 15,
        }),
      });

      console.log("API Response Status:", response.status);
      const data = await response.json();
      console.log("API Response Data:", data);

      if (!response.ok) {
        console.error("HTTP Error:", response.status, data);
        throw new Error(`HTTP ${response.status}: ${data.error || "Failed to fetch"}`);
      }

      if (data.error) {
        console.error("API Error:", data.error);
        throw new Error(data.error);
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        console.error("No questions in response:", data);
        throw new Error("No questions returned from API");
      }

      const questions: Question[] = data.questions.map(
        (q: GeneratedQuestion, idx: number) => ({
          id: `q-${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          // All questions from our static bank are MCQ
          type: "mcq" as const,
        })
      );

      console.log("Mapped questions:", questions.length);

      setState((prev) => ({
        ...prev,
        questions,
        timeRemaining: (config?.time || 20) * 60,
        isActive: true,
      }));
    } catch (err) {
      console.error("Generate error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate questions";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned");
      }

      const questions: Question[] = data.questions.map(
        (q: GeneratedQuestion, idx: number) => ({
          id: `q-${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          // Static questions are all MCQ, AI questions have mix
          type: data.isStatic ? "mcq" : (idx < (config?.questions || 15) - 5 ? "mcq" : "short"),
        })
      );

      console.log("Mapped questions:", questions.length);

      setState((prev) => ({
        ...prev,
        questions,
        timeRemaining: (config?.time || 20) * 60,
        isActive: true,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate questions. Please try again.";
      console.error("Generate error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!state.questions.length) return;

    setIsLoading(true);

    const mcqQuestions = state.questions.filter((q) => q.type === "mcq");
    let mcqCorrect = 0;

    mcqQuestions.forEach((q) => {
      if (state.answers[q.id] === q.correctAnswer) {
        mcqCorrect++;
      }
    });

    const totalMcq = mcqQuestions.length;

    const shortQuestions = state.questions.filter((q) => q.type === "short");
    let shortScore = 0;
    let shortAnswerResults: ShortAnswerResult[] | undefined;

    if (shortQuestions.length > 0) {
      try {
        const response = await fetch("/api/quiz/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: shortQuestions.map((q) => ({
              question: q.question,
              userAnswer: state.shortAnswers[q.id] || "",
              correctAnswer: q.correctAnswer,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          shortScore = data.score || 0;
          shortAnswerResults = data.results;
        }
      } catch { /* Silent fail for grading */ }
    }

    const totalQuestions = state.questions.length;
    const totalScore = Math.round(
      ((mcqCorrect * 100) / totalMcq + shortScore) / 2
    );
    const xpEarned = Math.round(totalScore * 0.5);

    setState((prev) => ({
      ...prev,
      isActive: false,
      isComplete: true,
      results: {
        score: totalScore,
        totalQuestions,
        mcqCorrect,
        shortAnswerScore: shortScore,
        xpEarned,
        shortAnswerResults,
      },
    }));

    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getLevelFromXP = (xp: number) => {
    if (xp < 200) return { level: 1, title: "Beginner" };
    if (xp < 500) return { level: 2, title: "Learner" };
    if (xp < 1000) return { level: 3, title: "Student" };
    if (xp < 2000) return { level: 4, title: "Scholar" };
    if (xp < 5000) return { level: 5, title: "Expert" };
    if (xp < 10000) return { level: 6, title: "Master" };
    if (xp < 20000) return { level: 7, title: "Grandmaster" };
    return { level: 8, title: "Legend" };
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  if (state.isComplete && state.results) {
    const { score, totalQuestions, mcqCorrect, xpEarned } = state.results;
    const level = getLevelFromXP(xpEarned);
    const isPerfect = score === 100;
    const isGood = score >= 70;

    return (
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-container to-primary mb-4 shadow-lg shadow-primary/20">
              {isPerfect ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : isGood ? (
                <Star className="w-12 h-12 text-white" />
              ) : (
                <Target className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-black font-headline text-on-surface mb-2">
              {isPerfect
                ? "Perfect Score! 🎉"
                : isGood
                ? "Great Job! 👏"
                : "Test Complete"}
            </h1>
            <p className="text-on-surface-variant">
              You completed {totalQuestions} questions
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 mb-6">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-2xl bg-surface-container-low">
                <div className="text-3xl font-black text-primary mb-1">
                  {score}%
                </div>
                <div className="text-sm font-bold text-on-surface-variant">
                  Score
                </div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-surface-container-low">
                <div className="text-3xl font-black text-tertiary mb-1">
                  +{xpEarned}
                </div>
                <div className="text-sm font-bold text-on-surface-variant">
                  XP Earned
                </div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-surface-container-low">
                <div className="text-2xl font-black text-primary-container mb-1">
                  Lv.{level.level}
                </div>
                <div className="text-sm font-bold text-on-surface-variant">
                  {level.title}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-on-surface">MCQ Correct</span>
                </div>
                <span className="font-black text-on-surface">
                  {mcqCorrect} /{" "}
                  {state.questions.filter((q) => q.type === "mcq").length}
                </span>
              </div>
              {state.questions
                .filter((q) => q.type === "short")
                .map((q, idx) => {
                  const result = state.results?.shortAnswerResults?.[idx];
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl overflow-hidden"
                    >
                      <div className="flex justify-between items-center p-4 bg-surface-container-low">
                        <div className="flex items-center gap-3">
                          {result?.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-bold text-on-surface">
                            Short Q{idx + 1}
                          </span>
                        </div>
                        <span
                          className={`font-black ${
                            result?.isCorrect ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {result?.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      {result && (
                        <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/10">
                          <div className="mb-3">
                            <p className="text-xs font-bold text-on-surface-variant mb-1">Your Answer:</p>
                            <p className="text-sm text-on-surface">{result.userAnswer || "(No answer)"}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs font-bold text-on-surface-variant mb-1">Correct Answer:</p>
                            <p className="text-sm text-primary font-bold">{result.correctAnswer}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary-container/10 border border-primary/10">
                            <p className="text-xs font-bold text-primary mb-1">Feedback:</p>
                            <p className="text-sm text-on-surface">{result.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setState(initialState)}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-on-surface bg-surface-container-low hover:bg-surface-container-high transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Take Another Test
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
            >
              Go to Dashboard
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.isActive && state.questions.length > 0) {
    const currentQuestion = state.questions[state.currentIndex];
    const progress =
      ((state.currentIndex + 1) / state.questions.length) * 100;

    return (
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (confirm("Are you sure? Your progress will be lost.")) {
                  setState(initialState);
                }
              }}
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface"
            >
              <ArrowLeft className="w-5 h-5" />
              Exit Test
            </button>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                state.timeRemaining <= 60
                  ? "bg-red-500/20 text-red-500 animate-pulse"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-black text-lg">
                {formatTime(state.timeRemaining)}
              </span>
            </div>
          </div>

          <div className="w-full h-2 bg-surface-container-high rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  Q{state.currentIndex + 1}
                </span>
                <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-sm font-bold">
                  {currentQuestion.type === "mcq" ? "MCQ" : "Short Answer"}
                </span>
              </div>
              <span className="text-on-surface-variant text-sm font-bold">
                {state.currentIndex + 1} / {state.questions.length}
              </span>
            </div>

            <h2 className="text-xl font-bold text-on-surface mb-8">
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === "mcq" ? (
              <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(
                  ([key, value]) => {
                    const isSelected = state.answers[currentQuestion.id] === key;
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            answers: { ...prev.answers, [currentQuestion.id]: key },
                          }))
                        }
                        className={`w-full p-4 rounded-2xl text-left font-bold transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-sm mr-3">
                          {key}
                        </span>
                        {value}
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={state.shortAnswers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      shortAnswers: {
                        ...prev.shortAnswers,
                        [currentQuestion.id]: e.target.value,
                      },
                    }))
                  }
                  placeholder="Write your answer here..."
                  className="w-full p-4 rounded-2xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant border-2 border-transparent focus:border-primary outline-none resize-none"
                  rows={4}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  currentIndex: Math.max(0, prev.currentIndex - 1),
                }))
              }
              disabled={state.currentIndex === 0}
              className="px-6 py-3 rounded-2xl font-bold text-on-surface bg-surface-container-low hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {state.currentIndex === state.questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={isLoading}
                className="px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-primary-container shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Grading...
                  </>
                ) : (
                  "Submit Test"
                )}
              </button>
            ) : (
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    currentIndex: Math.min(
                      prev.questions.length - 1,
                      prev.currentIndex + 1
                    ),
                  }))
                }
                className="px-8 py-3 rounded-2xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5 inline ml-1" />
              </button>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {state.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setState((prev) => ({ ...prev, currentIndex: idx }))}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  idx === state.currentIndex
                    ? "bg-primary text-white"
                    : state.answers[state.questions[idx].id] ||
                      state.shortAnswers[state.questions[idx].id]
                    ? "bg-primary-container text-primary"
                    : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4" />
            AI Powered
          </div>
          <h1 className="text-3xl font-black font-headline text-on-surface mb-2">
            AI Test Centre
          </h1>
          <p className="text-on-surface-variant">
            Select a subject and chapter to generate your personalized test
          </p>
        </div>

        {!state.subject ? (
          <>
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Select Subject
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() =>
                    setState((prev) => ({ ...prev, subject: subject.id as SubjectId }))
                  }
                  className="group p-6 rounded-3xl bg-surface-container-low hover:bg-surface-container-high transition-all hover:scale-[1.02] text-left"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}
                  >
                    {subject.icon}
                  </div>
                  <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {subject.chapters.length} chapters
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <button
              onClick={() =>
                setState((prev) => ({ ...prev, subject: null, chapter: null }))
              }
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Subjects
            </button>

            <div className="glass-card rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                    SUBJECTS.find((s) => s.id === state.subject)?.color
                  } flex items-center justify-center text-3xl shadow-lg`}
                >
                  {SUBJECTS.find((s) => s.id === state.subject)?.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-on-surface">
                    {SUBJECTS.find((s) => s.id === state.subject)?.name}
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Select a chapter to continue
                  </p>
                </div>
              </div>

              <label className="block text-sm font-bold text-on-surface-variant mb-2">
                Select Chapter
              </label>
              <select
                value={state.chapter || ""}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    chapter: e.target.value as Chapter,
                  }))
                }
                className="w-full p-4 rounded-2xl bg-surface-container-low text-on-surface border-2 border-transparent focus:border-primary outline-none"
              >
                <option value="">Choose a chapter...</option>
                {SUBJECTS.find((s) => s.id === state.subject)?.chapters.map(
                  (chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapter}
                    </option>
                  )
                )}
              </select>
            </div>

            {state.chapter && (
              <div className="animate-slide-up">
                <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Test Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {TEST_CONFIGS.map((config) => (
                    <button
                      key={config.id}
                      onClick={() =>
                        setState((prev) => ({ ...prev, configId: config.id }))
                      }
                      className={`p-6 rounded-3xl text-left transition-all ${
                        state.configId === config.id
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                          : "bg-surface-container-low hover:bg-surface-container-high"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3
                          className={`font-bold text-lg ${
                            state.configId === config.id
                              ? "text-white"
                              : "text-on-surface"
                          }`}
                        >
                          {config.label}
                        </h3>
                        {state.configId === config.id && (
                          <CheckCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-4 ${
                          state.configId === config.id
                            ? "text-white/80"
                            : "text-on-surface-variant"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Brain className="w-4 h-4" />
                          {config.questions} Q
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {config.time} min
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold">
                    {error}
                  </div>
                )}

                <button
                  onClick={generateQuestions}
                  disabled={isLoading || !state.configId}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-primary-container shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Start AI Test
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}