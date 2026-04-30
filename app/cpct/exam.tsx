"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getAnnouncements } from "@/app/actions/getUpdates"
import { getNewExams } from "@/app/actions/getNewExams";
import { getSmartExamData } from "@/app/actions/getOldExams";

interface Exam {
  exam_year: number
  exam_month: number
  latest_exam_date: string
}

interface Announcement {
  id: number
  title: string
  type: "pdf" | "link" | string
  message: string
  link?: string | null
  file_path?: string | null
}

interface Topic {
  id: number
  name: string
}

interface NewExam {
  id: number
  title: string
  exam_date: string
  duration_minutes: number
}

interface MonthGroup {
  year: number
  month: number
  monthName: string
}

export default function ExamPage() {
  const [exams2024, setExams2024] = useState<Exam[]>([])
  const [exams2023, setExams2023] = useState<Exam[]>([])
  const [topics, setTopics] = useState<Topic[]>([])

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newExams, setNewExams] = useState<NewExam[]>([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await getNewExams();

        if (!Array.isArray(data) && typeof data === "object") {
          const allExams = Object.values(data).flat() as NewExam[];
          setNewExams(allExams);
        } else {
          setNewExams(data as NewExam[]);
        }
      } catch (err: any) {
        console.error(err);
        setDbError(err?.message ?? "Failed to load exams")
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, []);

  const monthGroups: MonthGroup[] = Array.from(
    new Map(
      newExams.map((exam) => {
        const date = new Date(exam.exam_date)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const monthName = date.toLocaleString("default", {
          month: "long",
        })

        return [`${year}-${month}`, { year, month, monthName }]
      })
    ).values()
  )

  const uniqueYears = [
    ...new Set(monthGroups.map((group) => group.year)),
  ].sort((a, b) => b - a)

  const yearLabelNew =
    uniqueYears.length === 0
      ? "CPCT Exams"
      : uniqueYears.length === 1
        ? `CPCT Exam ${uniqueYears[0]}`
        : `CPCT Exams ${uniqueYears.join(", ")}`

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAnnouncements()
        setAnnouncements(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSmartExamData();

        setExams2024(data.exams2024);
        setExams2023(data.exams2023);
        setTopics(data.topics);
      } catch (err) {
        console.error(err);
      }
    }

    loadData(); 
  }, []);

  const renderExamMonths = (exams: Exam[], yearLabel: string) => {
    if (!exams.length) return null

    return (
      <>
        {yearLabel === "CPCT Exam 2024" && (
          <div className="max-w-6xl mx-auto">
             

            {loading ? (
              <p className="text-gray-500">Loading exams...</p>
            ) : dbError ? (
              <p className="text-red-500 text-sm">{dbError}</p>
            ) : monthGroups.length === 0 ? (
              <p className="text-gray-500">No exams available.</p>
            ) : (
              <>
                {uniqueYears.map((year) => {
                  const monthsForYear = monthGroups.filter(
                    (group) => group.year === year
                  )

                  return (
                    <div key={year} className="mb-10">
                      <h2 className="text-3xl font-semibold mb-6">
                        CPCT Exam {year}
                      </h2>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {monthsForYear.map((group) => {
                          const examDate = new Date(group.year, group.month - 1)

                          const now = new Date()
                          const thirtyDaysAgo = new Date()
                          thirtyDaysAgo.setDate(now.getDate() - 30)
                          const isNew = examDate >= thirtyDaysAgo

                          return (
                            <div
                              key={`new-${group.year}-${group.month}`}
                              onClick={() =>
                                router.push(
                                  `/cpct-new-exams?year=${group.year}&month=${group.month}`
                                )
                              }
                              className="cursor-pointer bg-[#cfe3ec] dark:bg-gray-800 
                                         hover:bg-[#bcd9e6] dark:hover:bg-gray-700 
                                         transition rounded-xl p-6 shadow-sm"
                            >
                              <div className="flex items-center gap-4 mb-4">
                                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                                  📅
                                </div>

                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-400 flex items-center">
                                  {group.monthName}
                                  {isNew && (
                                    <span className="ml-3 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                      New
                                    </span>
                                  )}
                                </h4>
                              </div>

                              <p className="text-gray-900 dark:text-gray-300">
                                {group.year}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
            {yearLabel}
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const monthName = new Date(
                0,
                exam.exam_month - 1
              ).toLocaleString("default", { month: "long" })

              return (
                <Link
                  key={`${exam.exam_year}-${exam.exam_month}`}
                  href={`/cpct-exams?year=${exam.exam_year}&month=${exam.exam_month}`}
                  className="bg-[#cfe3ec] dark:bg-gray-800 
                             hover:bg-[#bcd9e6] dark:hover:bg-gray-700 
                             transition rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                      📅
                    </div>

                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-400">
                      {monthName}
                    </h4>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300">
                    {exam.exam_year}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen py-3 mb-5 px-6 bg-gradient-to-br from-[#d6e5ec] to-[#c8d9e4] dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">

        <div id="takeone" className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-md p-10 transition">

          <div className="border-l-4 border-blue-900 dark:border-blue-500 pl-4 mb-10">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              CPCT Exam
            </h1>
          </div>

          {renderExamMonths(exams2024, "CPCT Exam 2024")}
          {renderExamMonths(exams2023, "CPCT Exam 2023")}

          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
              Topic Wise Paper
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/exam?topic_id=${topic.id}`}
                  className="bg-[#cfe3ec] dark:bg-gray-800 
                             hover:bg-[#bcd9e6] dark:hover:bg-gray-700
                             transition rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                      📘
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-400">
                      {topic.name}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 transition">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
              Study Resources
            </h3>

            <div className="space-y-4 text-blue-900 dark:text-blue-400">
              <Link href="#takeone" className="block border-b pb-3">
                📋 Practice Questions
              </Link>

              <Link href="/cpct-notes" className="block border-b pb-3">
                ✍️ Important Notes
              </Link>

              <Link href="/cpct-tips" className="block">
                🔖 Tips & Tricks
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
