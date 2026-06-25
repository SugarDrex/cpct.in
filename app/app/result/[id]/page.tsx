"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings, ArrowUp } from "lucide-react";
import { getSmartExamResult } from "@/app/actions/submitExam";

interface Choice {
  id: number;
  val: string;
}

interface Question {
  id: number;
  question: string;
}

interface ResultItem {
  question: Question;
  choices: Choice[];
  userChoice?: Choice | null;
  correctChoice?: Choice | null;
}

interface StoredResult {
  score: number;
  total: number;
  resultData: ResultItem[];
}

interface CorrectAnswerMap {
  [key: number]: {
    correctChoiceId: number | null;
    correctValue: string;
  };
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [data, setData] = useState<StoredResult | null>(null);
  const [correctAnswers, setCorrectAnswers] =
    useState<CorrectAnswerMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const stored = localStorage.getItem(`result_${id}`);
        if (!stored) {
          setLoading(false);
          return;
        }

        const parsed: StoredResult = JSON.parse(stored);
        setData(parsed);

        const serverMap = await getSmartExamResult(id);
        setCorrectAnswers(serverMap);

      } catch (error) {
        console.error("Error loading result:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculatedScore = useMemo(() => {
    if (!data) return 0;

    return data.resultData.filter((item) => {
      const apiCorrect = correctAnswers[item.question.id];

      const correctId =
        apiCorrect?.correctChoiceId ??
        item.correctChoice?.id ??
        null;

      return (
        item.userChoice &&
        Number(item.userChoice.id) === Number(correctId)
      );
    }).length;
  }, [data, correctAnswers]);

  useEffect(() => {
    if (!data) return;

    const updated = { ...data, score: calculatedScore };
    localStorage.setItem(
      `result_${id}`,
      JSON.stringify(updated)
    );
  }, [calculatedScore]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#2d3fa3] dark:bg-gray-900 text-white">
        <Settings className="w-16 h-16 mb-4 animate-spin" />
        <p className="text-lg font-semibold">Loading Result..</p>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">
        Result Not Found
      </div>
    );

  const passMark = Math.ceil(data.total * 0.6);
  const isPass = calculatedScore >= passMark;
  const answeredCount = data.resultData.filter(
    (item) => item.userChoice
  ).length;
  const notAnsweredCount = data.total - answeredCount;

  return (
    <div className="min-h-screen bg-[#2d3fa3] dark:bg-gray-900 py-12 px-4">
      <div className="text-center text-white mb-8">
        <h1 className="text-2xl font-semibold">Exam Result</h1>
      </div>

      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold dark:text-white">
            Your Score : {calculatedScore} / {data.total}
          </h2>

          <p
            className={`text-lg font-semibold mt-2 ${
              isPass ? "text-green-600" : "text-red-600"
            }`}
          >
            Result : {isPass ? "PASS" : "FAIL"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow">
            <h3 className="font-semibold dark:text-white">All Questions</h3>
            <p className="text-xl font-bold dark:text-white">{data.total}</p>
          </div>

          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow">
            <h3 className="font-semibold dark:text-white">Answered</h3>
            <p className="text-xl font-bold dark:text-white">{answeredCount}</p>
          </div>

          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg shadow">
            <h3 className="font-semibold dark:text-white">Not Answered</h3>
            <p className="text-xl font-bold dark:text-white">{notAnsweredCount}</p>
          </div>
        </div>

        <div className="space-y-8">
          {data.resultData.map((item, index) => {
            const apiCorrect = correctAnswers[item.question.id];

            const correctId =
              apiCorrect?.correctChoiceId ??
              item.correctChoice?.id ??
              null;

            const correctValue =
              apiCorrect?.correctValue ??
              item.correctChoice?.val ??
              "";

            const isCorrect =
              Number(item.userChoice?.id) ===
              Number(correctId);

            return (
              <div key={index} className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">

                <div
                  className="font-semibold text-base mb-4 dark:text-white"
                  dangerouslySetInnerHTML={{
                    __html: `${index + 1}. ${item.question.question}`,
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {item.choices.map((choice) => {
                    const correct =
                      Number(choice.id) === Number(correctId);
                    const user =
                      Number(choice.id) ===
                      Number(item.userChoice?.id);

                    return (
                      <div
                        key={choice.id}
                        className={`p-3 rounded border text-sm
                          ${
                            correct
                              ? "bg-green-100 dark:bg-green-800 border-green-600"
                              : user
                              ? "bg-red-100 dark:bg-red-800 border-red-600"
                              : "bg-white dark:bg-gray-800 dark:border-gray-700"
                          }`}
                        dangerouslySetInnerHTML={{
                          __html: choice.val,
                        }}
                      />
                    );
                  })}
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
                  <div className="p-3 rounded bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <p className="font-semibold mb-1 dark:text-white">Your Answer:</p>
                    {item.userChoice ? (
                      <div
                        className={`font-medium ${
                          isCorrect
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: item.userChoice.val,
                        }}
                      />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Not Answered
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <p className="font-semibold mb-1 dark:text-white">
                      Correct Answer:
                    </p>
                    <div
                      className="text-green-700 dark:text-green-400 font-medium"
                      dangerouslySetInnerHTML={{
                        __html: correctValue,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 text-sm">
                  <span className="font-semibold dark:text-white">Status: </span>
                  {item.userChoice ? (
                    isCorrect ? (
                      <span className="text-green-600 font-semibold">
                        Correct
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Wrong
                      </span>
                    )
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">
                      Not Attempted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-700 text-white p-3 rounded-full shadow-lg"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
          >
            Go To Home
          </button>
        </div>
      </div>
    </div>
  );
}
