"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";
const paragraphs = {
    english: [
        "Water is a substance composed of the chemical elements hydrogen and oxygen and existing in gaseous, liquid and solid states.",
        "It is one of the most plentiful and essential compounds.",
        "Water covers about seventy percent of the earth surface.",
        "It is vital for all known forms of life."
    ],
    hindi: [
        "इंटरनेट ने संचार व्यवस्था में क्रांति ला दी है और जानकारी को हर व्यक्ति तक तुरंत पहुंचा दिया है।",
        "समय का सही उपयोग जीवन में सफलता प्राप्त करने के लिए अत्यंत आवश्यक है।",
        "नियमित अध्ययन से ज्ञान बढ़ता है और आत्मविश्वास में वृद्धि होती है।",
        "कठिन परिश्रम और सही दिशा में प्रयास करने से बड़े से बड़ा लक्ष्य हासिल किया जा सकता है।",
        "धैर्य और सकारात्मक सोच व्यक्ति को हर परिस्थिति में मजबूत बनाती है।"


    ],

}

function shuffleArray(arr: string[]) {
    return [...arr].sort(() => Math.random() - 0.5)
}

export default function PracticePage() {
    const [language, setLanguage] = useState<"english" | "hindi">("english")
    const [darkMode, setDarkMode] = useState(false)
    const [timeLimit, setTimeLimit] = useState(5)
    const [timeLeft, setTimeLeft] = useState(300)
    const [started, setStarted] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [input, setInput] = useState("")
    const [text, setText] = useState("")

    const [keyDepressions, setKeyDepressions] = useState(0)
    const [backspaceCount, setBackspaceCount] = useState(0)
    const [liveErrors, setLiveErrors] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const REQUIRED_KEYS = 2000

    // Shuffle text on language change
    useEffect(() => {
        const shuffled = shuffleArray(paragraphs[language]).join(" ")
        setText(shuffled)
    }, [language])

    // Timer
    useEffect(() => {
        if (started && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!)
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(intervalRef.current!)
    }, [started])

    const handleChange = (value: string) => {
        if (!started) {
            setStarted(true)
            setTimeLeft(timeLimit * 60)
        }

        setKeyDepressions((prev) => prev + 1)
        setInput(value)

        const correct = value
            .split("")
            .filter((char, i) => char === text[i]).length

        setLiveErrors(value.length - correct)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Backspace") {
            setBackspaceCount((prev) => prev + 1)
            setKeyDepressions((prev) => prev + 1)
        }
    }

    const handleSubmit = () => {
        clearInterval(intervalRef.current!)
        setSubmitted(true)
    }

    const handleRetake = () => {
        setStarted(false)
        setSubmitted(false)
        setInput("")
        setKeyDepressions(0)
        setBackspaceCount(0)
        setLiveErrors(0)
        setTimeLeft(timeLimit * 60)
        const shuffled = shuffleArray(paragraphs[language]).join(" ")
        setText(shuffled)
    }

    // CPCT CALCULATIONS
    const totalTyped = input.length

    const correctChars = input
        .split("")
        .filter((char, i) => char === text[i]).length

    const wrongChars = totalTyped - correctChars

    const minutesUsed = (timeLimit * 60 - timeLeft) / 60 || 1 / 60

    const grossSpeed = (keyDepressions / 5 / minutesUsed).toFixed(2)
    const errorPenalty = (wrongChars / 5).toFixed(2)
    const netSpeed = (Number(grossSpeed) - Number(errorPenalty)).toFixed(2)

    const accuracy =
        totalTyped === 0
            ? "100"
            : ((correctChars / totalTyped) * 100).toFixed(2)

    const qualification =
        keyDepressions >= REQUIRED_KEYS ? "Qualified" : "Not Qualified"

    return (
        <div className={`  "dark bg-slate-900" : "bg-slate-100"}  `}>  <div className="mt-20 p-5 text-center bg-[#0b1b6f] text-white dark:bg-gray-900 dark:text-gray-100">
            <motion.h1
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl md:text-5xl font-bold"
            >
                Let`s Practice
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-4xl mx-auto text-md leading-relaxed text-indigo-100 dark:text-indigo-200 py-1"
            >
                Unlock Your Potential with Comprehensive CPCT Preparation
                Get Ready to Conquer the CPCT Exam with Confidence!
            </motion.p>
        </div>
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 py-5">


                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 space-y-6">


                    {/* Controls */}
                    <div className="flex flex-wrap justify-between  items-center gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setLanguage("english")}
                                className="px-4 cursor-pointer py-2 bg-blue-700 text-white rounded-lg"
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLanguage("hindi")}
                                className="px-4 py-2 bg-green-700 text-white cursor-pointer rounded-lg"
                            >
                                हिंदी
                            </button>
                        </div>

                        <select
                            value={timeLimit}
                            onChange={(e) => {
                                const value = Number(e.target.value)
                                setTimeLimit(value)
                                setTimeLeft(value * 60)
                            }}
                            className="border dark:bg-slate-700 dark:text-white p-2 rounded-lg cursor-pointer"
                        >
                            {[5, 10, 15, 20, 25, 30].map((t) => (
                                <option key={t} value={t}>
                                    {t} Minutes
                                </option>
                            ))}
                        </select>

                        <div className="text-lg font-semibold dark:text-white cursor-pointer">
                            Time Left: {Math.floor(timeLeft / 60)}:
                            {String(timeLeft % 60).padStart(2, "0")}
                        </div>
                    </div>

                    {/* LIVE DASHBOARD */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100 dark:bg-slate-700 p-2 rounded-xl text-sm dark:text-white">
                        <div>
                            <strong>Key Depressions</strong>
                            <div>{keyDepressions}</div>
                        </div>
                        <div>
                            <strong>Live Errors</strong>
                            <div className="text-red-500">{liveErrors}</div>
                        </div>
                        <div>
                            <strong>Backspace</strong>
                            <div>{backspaceCount}</div>
                        </div>
                        <div>
                            <strong>Required</strong>
                            <div>{REQUIRED_KEYS}</div>
                        </div>
                    </div>

                    {/* Passage */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl select-none border dark:border-slate-600 text-lg leading-8">
                        {text.split("").map((char, index) => {
                            let color = ""
                            if (index < input.length) {
                                color =
                                    input[index] === char
                                        ? "text-green-500"
                                        : "text-red-500"
                            }
                            return (
                                <span key={index} className={color}>
                                    {char}
                                </span>
                            )
                        })}
                    </div>

                    {/* Typing Area */}
                    <textarea
                        value={input}
                        disabled={submitted}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-4 rounded-xl border dark:bg-slate-700 dark:text-white dark:border-slate-600 h-36"
                    />

                    {!submitted ? (
                        <button
                            onClick={handleSubmit}
                            className="w-full cursor-pointer bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-xl"
                        >
                            Submit
                        </button>
                    ) : (
                        <div className="border-t dark:border-slate-600 pt-6 space-y-4 dark:text-white">
                            <h2 className="text-xl font-bold">
                                Result
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>Gross Speed: {grossSpeed} WPM</div>
                                <div>Net Speed: {netSpeed} WPM</div>
                                <div>Accuracy: {accuracy}%</div>
                                <div>Error Penalty: {errorPenalty}</div>
                                <div>Key Depressions: {keyDepressions}</div>
                                <div>Status: {qualification}</div>
                            </div>

                            {/* Highlight Wrong Words */}
                            <div className="mt-4 bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Your Typed Text (Highlighted Errors)
                                </h3>
                                <div className="whitespace-pre-wrap">
                                    {text.split("").map((char, index) => {
                                        if (index >= input.length) return null
                                        return (
                                            <span
                                                key={index}
                                                className={
                                                    input[index] === char
                                                        ? "text-green-500"
                                                        : "text-red-500 font-semibold"
                                                }
                                            >
                                                {input[index]}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={handleRetake}
                                className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl"
                            >
                                Retake Test
                            </button>
                        </div>
                    )}
                </div>
                {/* SIDEBAR */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6">

                    <h2 className="text-xl font-bold dark:text-white">
                        Study Resources
                    </h2>

                 <div className="space-y-4 text-blue-900 dark:text-blue-400">
              <Link href="#takeone" className="block border-b dark:border-gray-700 pb-3 hover:text-blue-600 dark:hover:text-blue-300 transition">
                📋  Practice Questions
              </Link>

              <Link href="/cpct-notes" className="block border-b dark:border-gray-700 pb-3 hover:text-blue-600 dark:hover:text-blue-300 transition">
                ✍️ Important Notes
              </Link>

              <Link href="/cpct-tips" className="block hover:text-blue-600 dark:hover:text-blue-300 transition">
                🔖 Tips & Tricks
              </Link>
              <div className="relative inline-block">
                <Link
                  href="/notes"
                  className="block border-b dark:border-gray-700 pb-3 
    hover:text-blue-600 dark:hover:text-blue-300 
    transition pr-6"
                >
                  👉 Buy Exam sets and study materials
                </Link>

                <span className="absolute top-1 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div></div>

                </div>
            </div>
        </div>
    )
}