"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import mammoth from "mammoth";
import { useRouter } from "next/navigation";
interface Option {
  value: string;
  text: string;
}

interface Question {
  questionNumber: number;
  question: string;
  question_hindi: string;
  options: Option[];
  correctAnswer: string;
}

interface ExamData {
  examTitle: string;
  examDate: string;
  questions: Question[];
}

export default function DocxToJsonConverter() {
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const fileName = selectedFile.name.replace(".docx", "");
      setExamTitle(fileName);

      const dateMatch = fileName.match(
        /(\d{1,2})(st|nd|rd|th)?[\s\-]*(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)[\s\-]*(\d{4})/i
      );

      if (dateMatch) {
        const day = dateMatch[1].padStart(2, "0");
        const monthName = dateMatch[3].toLowerCase();
        const year = dateMatch[4];

        const monthMap: Record<string, string> = {
          jan: "01",
          january: "01",
          feb: "02",
          february: "02",
          mar: "03",
          march: "03",
          apr: "04",
          april: "04",
          may: "05",
          jun: "06",
          june: "06",
          jul: "07",
          july: "07",
          aug: "08",
          august: "08",
          sep: "09",
          september: "09",
          oct: "10",
          october: "10",
          nov: "11",
          november: "11",
          dec: "12",
          december: "12",
        };

        const month =
          monthMap[monthName] ||
          monthMap[monthName.substring(0, 3)];

        if (month) {
          setExamDate(`${year}-${month}-${day}`);
        }
      }
    }
  };

  const downloadJSON = (data: ExamData) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${examTitle || "exam"}-${examDate || "file"}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseDocx = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: ["highlight => span.highlighted"],
        }
      );

      const html = result.value;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const paragraphs = Array.from(doc.querySelectorAll("p"));

      const questions: Question[] = [];
      let currentQuestion: Question | null = null;

      for (const p of paragraphs) {
        const text = p.textContent?.trim() ?? "";

        if (text.startsWith("Question Number")) {
          if (
            currentQuestion !== null &&
            currentQuestion.question &&
            currentQuestion.options.length > 0
          ) {
            questions.push(currentQuestion);
          }

          currentQuestion = {
            questionNumber: questions.length + 1,
            question: "",
            question_hindi: "",
            options: [],
            correctAnswer: "",
          };

          continue;
        }

        if (currentQuestion === null) continue;
        if (text.toLowerCase().startsWith("options")) continue;

        const optionMatch = text.match(/^(\d+)\.\s(.+)/);

        if (optionMatch) {
          const optionNumber = optionMatch[1];

          currentQuestion.options.push({
            value: optionNumber,
            text: optionMatch[2],
          });

          if (
            p.querySelector(".highlighted") ||
            p.querySelector("span[style*='background-color']")
          ) {
            currentQuestion.correctAnswer = optionNumber;
          }

          continue;
        }

        const answerMatch = text.match(/answer\s*[:\-]?\s*(\d+)/i);
        if (answerMatch) {
          currentQuestion.correctAnswer = answerMatch[1];
          continue;
        }

        if (!currentQuestion.question) {
          currentQuestion.question = text;
        } else if (!currentQuestion.question_hindi) {
          currentQuestion.question_hindi = text;
        }
      }

      if (
        currentQuestion !== null &&
        currentQuestion.question &&
        currentQuestion.options.length > 0
      ) {
        questions.push(currentQuestion);
      }

      const cleanedQuestions = questions.filter(
        (q) =>
          q.question &&
          q.options.length === 4 &&
          q.correctAnswer !== ""
      );

      const formattedData: ExamData = {
        examTitle: examTitle || "Untitled Exam",
        examDate: examDate || "",
        questions: cleanedQuestions,
      };

      setOutput(formattedData);
      downloadJSON(formattedData);
    } catch (error) {
      console.error("Parsing error:", error);
      alert("Invalid DOCX structure.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 py-25">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 text-gray-900 dark:text-white"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          DOCX to Exam JSON Converter
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <input
            type="text"
            placeholder="Exam Title"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            className="border dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="border dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="mb-6">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="border dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={parseDocx}
          disabled={loading}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-300 transition w-full"
        >
          {loading ? "Converting..." : "Convert & Download JSON"}
        </button>

        {output && (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-gray-100 dark:bg-gray-700 p-6 rounded-xl overflow-auto text-sm text-gray-900 dark:text-gray-100"
          >
            {JSON.stringify(output, null, 2)}
          </motion.pre>
        )}
      </motion.div>

      <div className="py-20 ">
        <div className="flex items-center justify-between relative">
          {["Select File", "Convert", "Save JSON", "Upload Exam"].map(
            (label, index) => (
              <div key={index} className="flex flex-col items-center flex-1 relative">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition ${step > index
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                    }`}
                >
                  step {index + 1}
                </div>
                <span className="mt-2 text-xs text-center">{label}</span>
              </div>
            )
          )}

          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 -z-10">
            <div
              className="h-1 bg-green-500 transition-all duration-500"
              style={{ width: `${(step - 1) * 33}%` }}
            />
          </div>
        </div>
      </div>{showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-8 w-[90%] max-w-md text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Exam Saved Successfully 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your exam JSON has been generated and saved.
            </p>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/admin/newexams");
                router.refresh();
              }}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Go to Upload Exam Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}/*"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import mammoth from "mammoth";

interface Option {
  value: string;
  text: string;
}

interface Question {
  questionNumber: number;
  question: string;
  question_hindi: string;
  options: Option[];
  correctAnswer: string;
}

interface ExamData {
  examTitle: string;
  examDate: string;
  questions: Question[];
}

export default function DocxToJsonConverter() {
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ UPDATED: Auto title & date detection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const fileName = selectedFile.name.replace(".docx", "");

      // Auto set title
      setExamTitle(fileName);

      // Extract date from filename
      const dateMatch = fileName.match(
        /(\d{1,2})(st|nd|rd|th)?[\s\-]*(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)[\s\-]*(\d{4})/i
      );

      if (dateMatch) {
        const day = dateMatch[1].padStart(2, "0");
        const monthName = dateMatch[3].toLowerCase();
        const year = dateMatch[4];

        const monthMap: Record<string, string> = {
          jan: "01",
          january: "01",
          feb: "02",
          february: "02",
          mar: "03",
          march: "03",
          apr: "04",
          april: "04",
          may: "05",
          jun: "06",
          june: "06",
          jul: "07",
          july: "07",
          aug: "08",
          august: "08",
          sep: "09",
          september: "09",
          oct: "10",
          october: "10",
          nov: "11",
          november: "11",
          dec: "12",
          december: "12",
        };

        const month =
          monthMap[monthName] ||
          monthMap[monthName.substring(0, 3)];

        if (month) {
          setExamDate(`${year}-${month}-${day}`);
        }
      }
    }
  };

  const downloadJSON = (data: ExamData) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${examTitle || "exam"}-${examDate || "file"}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseDocx = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: ["highlight => span.highlighted"],
        }
      );

      const html = result.value;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const paragraphs = Array.from(doc.querySelectorAll("p"));

      const questions: Question[] = [];
      let currentQuestion: Question | null = null;

      for (const p of paragraphs) {
        const text = p.textContent?.trim() ?? "";

        if (text.startsWith("Question Number")) {
          if (
            currentQuestion !== null &&
            currentQuestion.question &&
            currentQuestion.options.length > 0
          ) {
            questions.push(currentQuestion);
          }

          currentQuestion = {
            questionNumber: questions.length + 1,
            question: "",
            question_hindi: "",
            options: [],
            correctAnswer: "",
          };

          continue;
        }

        if (currentQuestion === null) continue;

        if (text.toLowerCase().startsWith("options")) continue;

        const optionMatch = text.match(/^(\d+)\.\s(.+)/);

        if (optionMatch) {
          const optionNumber = optionMatch[1];

          currentQuestion.options.push({
            value: optionNumber,
            text: optionMatch[2],
          });

          if (
            p.querySelector(".highlighted") ||
            p.querySelector("span[style*='background-color']")
          ) {
            currentQuestion.correctAnswer = optionNumber;
          }

          continue;
        }

        const answerMatch = text.match(/answer\s*[:\-]?\s*(\d+)/i);
        if (answerMatch) {
          currentQuestion.correctAnswer = answerMatch[1];
          continue;
        }

        if (!currentQuestion.question) {
          currentQuestion.question = text;
        } else if (!currentQuestion.question_hindi) {
          currentQuestion.question_hindi = text;
        }
      }

      if (
        currentQuestion !== null &&
        currentQuestion.question &&
        currentQuestion.options.length > 0
      ) {
        questions.push(currentQuestion);
      }

      const cleanedQuestions = questions.filter(
        (q) =>
          q.question &&
          q.options.length === 4 &&
          q.correctAnswer !== ""
      );

      const formattedData: ExamData = {
        examTitle: examTitle || "Untitled Exam",
        examDate: examDate || "",
        questions: cleanedQuestions,
      };

      setOutput(formattedData);
      downloadJSON(formattedData);
    } catch (error) {
      console.error("Parsing error:", error);
      alert("Invalid DOCX structure.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 py-25">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          DOCX to Exam JSON Converter
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <input
            type="text"
            placeholder="Exam Title"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            className="border p-3 rounded-lg w-full"
          />

          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="border p-3 rounded-lg w-full"
          />
        </div>

        <div className="mb-6">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="border p-3 rounded-lg w-full"
          />
        </div>

        <button
          onClick={parseDocx}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition w-full"
        >
          {loading ? "Converting..." : "Convert & Download JSON"}
        </button>

        {output && (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-gray-100 p-6 rounded-xl overflow-auto text-sm"
          >
            {JSON.stringify(output, null, 2)}
          </motion.pre>
        )}
      </motion.div>
    </div>
  );
}*/