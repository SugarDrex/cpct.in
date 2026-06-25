"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { getNewExamById } from "@/app/actions/getNewExamsId";

export default function NewxamPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
 useEffect(() => {
  const fetchExam = async () => {
    if (!id || typeof id !== "string") return;

    try {
      setLoading(true);

      const data = await getNewExamById(id);

      if (!data.success) {
        console.error(data.error);
        return;
      }

      setExam(data.exam);
      setQuestions(data.questions || []);

      const hours = parseInt(data.exam?.d_hour || 0);
      const minutes = parseInt(data.exam?.d_minut || 0);

      const totalSeconds = hours * 3600 + minutes * 60;

      setTimeLeft(totalSeconds > 0 ? totalSeconds : 3600);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchExam();
}, [id]);
 /* useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/newexams/${id}`);
        const data = await res.json();

        setExam(data.exam);
        setQuestions(data.questions || []);

        const hours = parseInt(data.exam?.d_hour || 0);
        const minutes = parseInt(data.exam?.d_minut || 0);

        const totalSeconds = hours * 3600 + minutes * 60;

        // Prevent instant submit if DB returns 0
        if (totalSeconds > 0) {
          setTimeLeft(totalSeconds);
        } else {
          setTimeLeft(3600); // default 1 hour safety
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExam();
  }, [id]);
*/
  // ================= TIMER FIXED =================
  useEffect(() => {
    if (!questions.length || submitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions.length, submitted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const handleSelect = (choiceId: number) => {
    setAnswers({ ...answers, [questions[current].id]: choiceId });
  };

  // ================= SUBMIT =================
  const handleSubmitExam = () => {
    if (submitted) return;
    setSubmitted(true);

    let score = 0;

    const resultData = questions.map((q) => {
      const userChoiceId = answers[q.id];

      const correctChoice = q.choices?.find(
        (c: any) => c.id === q.correct_choice_id
      );

      const userChoice = q.choices?.find(
        (c: any) => c.id === userChoiceId
      );

      if (correctChoice && correctChoice.id === userChoiceId) {
        score++;
      }

      return {
        question: q,
        choices: q.choices,
        correctChoice,
        userChoice,
      };
    });

    localStorage.setItem(
      `result_${id}`,
      JSON.stringify({
        score,
        total: questions.length,
        resultData,
      })
    );

    router.push(`/newresult/${id}`);
  };

  // ================= LOADING =================
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 dark:from-slate-900 dark:to-slate-800 text-white transition-all duration-300">
        <Settings className="w-16 h-16 mb-4 animate-spin" />
        <p className="text-lg font-semibold tracking-wide">
          Loading Exam...
        </p>
      </div>
    );

  if (!exam || !questions.length)
    return <div className="p-10">Loading...</div>;
  if (!exam || !questions.length)
    return <div className="p-10">Loading...</div>;

  const question = questions[current];

  return (
    <div className="min-h-screen bg-[#2d3fa3] text-gray-900 text-sm py-20">

      {/* HEADER */}
      <div className="bg-[#2d3fa3] text-white text-center py-3">
        <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
          {exam.title}
        </h1>
        <p className="text-xs md:text-sm mt-2 tracking-wider">
          BEST OF LUCK
        </p>
      </div>

      {/* TIMER BAR */}
      <div className="bg-[#2f73b7] px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-white">

          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-4 py-2  cursor-pointer rounded shadow hover:bg-gray-300 transition"
          >
            ← Back
          </button>

          <div className="bg-white text-[#2f73b7] px-6 py-2 rounded-md font-semibold shadow">
            Time Remaining : {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* ONLINE EXAM */}
      <div className="bg-[#1e3a8a] text-white text-center py-2 font-semibold">
        Online Exam
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col xl:flex-row gap-6 bg-gradient-to-r from-[#cbe5ea] to-[#d6eef3]">

        {/* LEFT PANEL */}
        <div className="w-full xl:w-64 flex flex-col gap-6">

          <div className="bg-white rounded shadow">
            <div className="bg-blue-900 text-white text-center py-2 font-semibold">
              Indicators
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Unanswered</span>
                <div className="w-6 h-6 bg-gray-200 border rounded"></div>
              </div>
              <div className="flex justify-between">
                <span>Answered</span>
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="flex justify-between">
                <span>Marked for Review</span>
                <div className="w-6 h-6 bg-yellow-400 rounded"></div>
              </div>
              <div className="flex justify-between">
                <span>Answered & Review</span>
                <div className="w-6 h-6 bg-cyan-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow">
            <div className="bg-blue-900 text-white text-center py-2 font-semibold">
              Counting
            </div>
            <div className="p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span>All Questions</span>
                <span>{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions Answered</span>
                <span>{Object.keys(answers).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions Unanswered</span>
                <span>
                  {questions.length - Object.keys(answers).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER QUESTION */}
        <div className="flex-1 bg-white rounded shadow p-6">

          <div className="mb-4 font-medium">
            Question {current + 1} of {questions.length}
          </div>

          <div
            className="mb-6 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: question.question,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.choices.map((choice: any) => (
              <button
                key={choice.id}
                onClick={() => handleSelect(choice.id)}
                className={`p-4 rounded border text-left transition  cursor-pointer ${
                  answers[question.id] === choice.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-100 hover:bg-blue-200 "
                }`}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: choice.val,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
              className="bg-black text-white px-6 py-2 cursor-pointer rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setCurrent(
                  current < questions.length - 1
                    ? current + 1
                    : current
                )
              }
              className="bg-blue-700 text-white px-6 py-2 rounded cursor-pointer"
            >
              Save & Next
            </button>
          </div>
        </div>

        {/* RIGHT NAV */}
        <div className="w-full xl:w-72 bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-4">Questions</h3>

          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrent(index)}
                className={`p-2 rounded text-sm  cursor-pointer ${
                  answers[q.id]
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSubmit(true)}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded  cursor-pointer"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* SUBMIT MODAL */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="mb-4 font-semibold">
              Are you sure you want to submit?
            </h2>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleSubmitExam}
                className="bg-green-600 text-white px-6 py-2 rounded  cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowSubmit(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded  cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}