 "use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ExamDetails() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Added Modals
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  // =============================
  // FETCH EXAM
  // =============================
  const fetchExam = async () => {
    const res = await fetch(`/api/admin/newexams/${examId}`);
    const json = await res.json();
    setData(json);
    setOriginalData(json);
    setLoading(false);
  };

  useEffect(() => {
    if (examId) fetchExam();
  }, [examId]);

  // =============================
  // FIELD HANDLERS
  // =============================
  const handleExamChange = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      exam: { ...prev.exam, [field]: value },
    }));
  };

  const handleQuestionChange = (
    qIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...data.questions];
    updated[qIndex][field] = value;
    setData({ ...data, questions: updated });
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...data.questions];
    updated[qIndex].options[optIndex][field] = value;
    setData({ ...data, questions: updated });
  };

  // =============================
  // SAVE UPDATE
  // =============================
  const handleSave = async () => {
    try {
      setSaving(true);

      await fetch(`/api/admin/newexams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: data.exam,
          questions: data.questions,
        }),
      });

      setEditMode(false);
      setSuccessModal(true);
    } catch (err) {
      setErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setData(originalData);
    setEditMode(false);
  };

  if (loading)
    return (
      <div className="text-white p-10 min-h-screen">
        Loading...
      </div>
    );

  if (!data?.exam) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 
    dark:from-gray-950 dark:via-gray-900 dark:to-black 
    text-gray-800 dark:text-gray-200 
    transition-colors duration-300 py-25 px-4 sm:px-6">

      <div className="max-w-6xl mx-auto 
      bg-white dark:bg-gray-900 
      border border-gray-300 dark:border-gray-700
      shadow-[0_20px_60px_rgba(0,0,0,0.15)] 
      rounded-3xl p-6 sm:p-10 
      transition-all duration-300">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-12">

          {editMode ? (
            <input
              className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl text-2xl w-full"
              value={data.exam.title}
              onChange={(e) =>
                handleExamChange("title", e.target.value)
              }
            />
          ) : (
            <h1
              className="text-3xl font-extrabold tracking-wide text-blue-900 dark:text-blue-400 cursor-pointer"
              onDoubleClick={() => setEditMode(true)}
            >
              {data.exam.title}
            </h1>
          )}

          <div className="flex gap-3 ml-6">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="cursor-pointer p-2
  bg-black hover:bg-gray-800
  text-white font-medium px-6 py-2.5
  rounded-xl
  transition-all duration-300
  shadow-md hover:shadow-3xl
  active:scale-95"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer bg-green-600 hover:bg-green-700 
                  text-white px-5 py-2 rounded-xl 
                  transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Update"}
                </button>

                <button
                  onClick={handleCancel}
                  className="cursor-pointer
  bg-white dark:bg-gray-800
  hover:bg-blue-50 dark:hover:bg-gray-700
  
  text-blue-600 dark:text-blue-400
  
  border border-blue-600 dark:border-blue-400
  
  font-semibold px-6 py-2.5
  rounded-xl
  
  transition-all duration-300
  focus:outline-none 
  focus:ring-4 focus:ring-blue-300 
  dark:focus:ring-blue-800"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* EXAM META */}
        <div className="mb-8 space-y-4">
          {editMode ? (
            <>
              <input
                type="date"
                className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl"
                value={data.exam.exam_date?.split("T")[0]}
                onChange={(e) =>
                  handleExamChange("exam_date", e.target.value)
                }
              />

              <input
                type="number"
                className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl"
                value={data.exam.duration_minutes}
                onChange={(e) =>
                  handleExamChange(
                    "duration_minutes",
                    e.target.value
                  )
                }
              />
            </>
          ) : (
            <div className="flex gap-4">
              <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-sm font-semibold">
                📅 {data.exam.exam_date}
              </span>

              <span className="px-4 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-sm font-semibold">
                ⏱ {data.exam.duration_minutes} mins
              </span>
            </div>
          )}
        </div>

        {/* QUESTIONS */}
        <div className="space-y-8">
          {data.questions?.map((q: any, qIndex: number) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-700 
              shadow-lg p-6 rounded-3xl 
              transition hover:shadow-xl"
            >
              {editMode ? (
                <input
                  className="w-full bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-xl mb-4"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(
                      qIndex,
                      "question",
                      e.target.value
                    )
                  }
                />
              ) : (
                <h2
                  className="font-semibold mb-4 cursor-pointer text-gray-800 dark:text-gray-200"
                  onDoubleClick={() => setEditMode(true)}
                >
                  Q{q.question_number}. {q.question}
                </h2>
              )}

              <div className="grid grid-cols-2 gap-4">
                {q.options?.map((opt: any, optIndex: number) => (
                  <div key={opt.id}>
                    {editMode ? (
                      <div className="flex gap-2 items-center">
                        <input
                          className="flex-1 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-xl"
                          value={opt.option_text}
                          onChange={(e) =>
                            handleOptionChange(
                              qIndex,
                              optIndex,
                              "option_text",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="checkbox"
                          checked={opt.is_correct}
                          onChange={(e) =>
                            handleOptionChange(
                              qIndex,
                              optIndex,
                              "is_correct",
                              e.target.checked
                            )
                          }
                        />
                      </div>
                    ) : (
                      <div
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          opt.is_correct
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        {opt.option_value}. {opt.option_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {successModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
            🎉 Updated Successfully
            </h2>
            <button
              onClick={() => setSuccessModal(false)}
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {errorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ❌ Update Failed
            </h2>
            <button
              onClick={() => setErrorModal(false)}
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
/*"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

export default function ExamDetails() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExam = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`/api/admin/newexams/${examId}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Exam not found");
        }
        throw new Error("Failed to load exam");
      }

      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (examId) fetchExam();
  }, [examId]);

  // ----------------------
  // LOADER STATE
  // ----------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // ----------------------
  // ERROR STATE
  // ----------------------
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-500">
        <p className="mb-4">{error}</p>
        <button
          onClick={() => router.push("/admin/exams")}
          className="bg-purple-600 px-4 py-2 rounded-xl text-white"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (!data?.exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        No exam data available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-950 py-20 px-6">
      <div className="max-w-5xl mx-auto">

  
        <div className="flex justify-between items-center mb-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl text-white font-bold"
          >
            {data.exam.title}
          </motion.h1>

          <button
            onClick={() => fetchExam(true)}
            className="bg-purple-600 px-4 py-2 rounded-xl text-white"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

      <div className="text-gray-400 mb-8">
          Date: {data.exam.exam_date} | Duration:{" "}
          {data.exam.duration_minutes} mins
        </div>

 
        <div className="space-y-6">
          {data.questions?.length === 0 && (
            <div className="text-gray-400">
              No questions available for this exam.
            </div>
          )}

          {data.questions?.map((q: any) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl hover:bg-white/20 transition"
            >
              <h2 className="text-white font-semibold mb-3">
                Q{q.question_number}. {q.question}
              </h2>

              {q.question_hindi && (
                <p className="text-gray-400 mb-4">
                  {q.question_hindi}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {q.options?.map((opt: any) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-lg transition ${
                      opt.is_correct
                        ? "bg-green-600 text-white"
                        : "bg-white/5 text-gray-300"
                    }`}
                  >
                    {opt.option_value}. {opt.option_text}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Marks: {q.marks} | Negative: {q.negative_marks}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} */