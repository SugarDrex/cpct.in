"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { getExamOldByIdModel } from "@/app/actions/getOldExamsIdModel";

export default function ExamPage() {
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
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);


/*  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/exams/${id}`);
        const data = await res.json();

        setExam(data.exam);
        setQuestions(data.questions);

        const hours = parseInt(data.exam?.d_hour || 0);
        const minutes = parseInt(data.exam?.d_minut || 0);
        setTimeLeft(hours * 3600 + minutes * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExam();
  }, [id]);*/

  useEffect(() => {
  const fetchExam = async () => {
    try {
      setLoading(true);

      const data = await getExamOldByIdModel(id as string);

      if (data.error) {
        console.error(data.error);
        return;
      }

      setExam(data.exam);
      setQuestions(data.questions);

      const hours = parseInt(data.exam?.d_hour || 0);
      const minutes = parseInt(data.exam?.d_minut || 0);

      setTimeLeft(hours * 3600 + minutes * 60);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchExam();
}, [id]);


  useEffect(() => {
    if (!questions.length || submitted) return;

    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, questions, submitted]);

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

  const handleSubmitExam = () => {
    if (submitted) return;

    setSubmitting(true);
    setSubmitted(true);

    setTimeout(() => {
      let score = 0;

      const resultData = questions.map((q) => {
        const userChoiceId = answers[q.id];
        let correctChoice: any = null;

        if (q.correct_choice_id) {
          correctChoice = q.choices.find(
            (c: any) => c.id === q.correct_choice_id
          );
        }

        const userChoice = q.choices.find(
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

      router.push(`/result/${id}`);
    }, 1500);
  };



  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen 
                    bg-[#2d3fa3] dark:bg-gray-900 
                    text-white dark:text-gray-200 transition-colors duration-300">

        <Settings
          className="w-16 h-16 mb-4 animate-spin 
                   text-white dark:text-blue-400 
                   drop-shadow-md dark:drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]"
        />

        <p className="text-lg font-semibold tracking-wide">
          Loading Exam...
        </p>
      </div>
    );

  if (!exam || !questions.length)
    return <div className="p-10">Loading...</div>;

  const question = questions[current];

  return (
    <div className="min-h-screen bg-[#2d3fa3] dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm">


      <div className="bg-[#2d3fa3] dark:bg-gray-800 text-white text-center py-6">
        <h1 className="text-xl font-semibold">{exam.title}</h1>
        <p className="text-xs mt-1">BEST OF LUCK</p>
      </div>


      <div className="bg-[#2d3fa3] dark:bg-gray-900 text-white text-center py-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
          {exam?.title}
        </h1>
        <p className="text-xs md:text-sm mt-2 tracking-wider">
          BEST OF LUCK
        </p>
      </div>


      <div className="bg-[#2f73b7] dark:bg-gray-800 px-4 md:px-4 py-2">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-white">

          <div className="flex justify-start">
            <button
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow cursor-pointer hover:bg-gray-300 transition"
            >
              ← Back
            </button>
          </div>

          <div className="text-center font-semibold text-base md:text-lg">

          </div>

          <div className="flex justify-start md:justify-end">
            <div className="bg-white text-[#2f73b7] px-4 py-2 rounded-md font-semibold shadow text-sm md:text-base">
              Time Remaining : {formatTime(timeLeft)}
            </div>
          </div>

        </div>
      </div>

      <div className="text-center  font-semibold bg- text-white dark:text-gray-400 md:text-lg">
        Online Exam
      </div>

      <div className="flex flex-col xl:flex-row gap-6 p-6 select-none bg-gradient-to-r from-[#cbe5ea] to-[#d6eef3] ">

        <div className="w-full xl:w-64 flex flex-col gap-6">

          <div className="bg-white dark:bg-gray-800 rounded shadow">
            <div className="bg-blue-900 text-white text-center py-2 font-semibold">
              Indicators
            </div>

            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Unanswered</span>
                <div className="w-6 h-6 bg-gray-200 rounded border"></div>
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

          <div className="bg-white dark:bg-gray-800 rounded shadow">
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

        <div className="flex-1 bg-white dark:bg-gray-800 rounded shadow p-6">

          <div className="mb-4">
            Question {current + 1} of {questions.length}
          </div>

          <div
            className="mb-6 text-lg"
            dangerouslySetInnerHTML={{
              __html: question.question,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.choices.map((choice: any) => (
              <button
                key={choice.id}
                onClick={() => handleSelect(choice.id)}
                className={`p-4 rounded border text-left cursor-pointer ${answers[question.id] === choice.id
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 dark:bg-gray-700"
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
              className="bg-gray-400 text-white px-6 py-2 rounded cursor-pointer disabled:cursor-not-allowed"
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

        <div className="w-full xl:w-72 bg-white dark:bg-gray-800 rounded shadow p-4">
          <h3 className="font-semibold mb-4">Questions</h3>

          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrent(index)}
                className={`p-2 rounded text-sm cursor-pointer ${answers[q.id]
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSubmit(true)}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded cursor-pointer"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {showSubmit && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h2 className="mb-4 font-semibold">
              Are you sure you want to submit?
            </h2>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleSubmitExam}
                className="bg-green-600 text-white px-6 py-2 rounded cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowSubmit(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded cursor-pointer"
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