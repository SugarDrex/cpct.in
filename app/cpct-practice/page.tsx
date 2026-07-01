"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Clock,
    FileText,
    BarChart3,
    RotateCcw,
    Languages,
    KeyRound,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    ClockAlertIcon,
    Download,
    Printer,
    Award,
    TrendingUp,
} from "lucide-react"

 

const HINDI_FONT_OPTIONS = [
    { id: "mangal", label: "Mangal (Unicode)", family: "'Mangal','Noto Sans Devanagari',sans-serif" },
    { id: "noto", label: "Noto Sans Devanagari", family: "'Noto Sans Devanagari','Mangal',sans-serif" },
    { id: "tiro", label: "Tiro Devanagari Hindi", family: "'Tiro Devanagari Hindi','Mangal',serif" },
    { id: "krutidev", label: "Kruti Dev 010 (legacy)", family: "'Kruti Dev 010','Mangal',sans-serif" },
    { id: "devlys", label: "DevLys 010 (legacy)", family: "'DevLys 010','Mangal',sans-serif" },
    { id: "shree", label: "Shree-Dev 0714 (legacy)", family: "'Shree-Dev-0714','Mangal',sans-serif" },
] as const

type FontId = (typeof HINDI_FONT_OPTIONS)[number]["id"]
type Language = "english" | "hindi"
type Difficulty = "easy" | "medium" | "hard"

const DIFFICULTY_LEVELS: Record<Difficulty, { duration: number; label: string; labelHi: string; note: string }> = {
    easy: { duration: 5, label: "Easy", labelHi: "सरल", note: "5 min · relaxed pace" },
    medium: { duration: 10, label: "Medium", labelHi: "मध्यम", note: "10 min · standard exam pace" },
    hard: { duration: 15, label: "Hard", labelHi: "कठिन", note: "15 min · full exam simulation" },
}

const KEYS_PER_MINUTE_TARGET = 200

const FALLBACK_TEXTS: Record<Language, Record<Difficulty, string>> = {
    english: {
    easy: `Reading is one of the simplest habits that can change a person's life. It opens the mind to new ideas, improves vocabulary, strengthens memory, and develops the ability to think clearly and logically. People who read regularly often become better communicators because they are exposed to different styles of writing and expression. Even spending fifteen to twenty minutes each day with a good book can make a noticeable difference over time in overall personality development. Reading also reduces stress by allowing the mind to focus on meaningful content instead of constant distractions from social media and daily worries. Public libraries, schools, and digital platforms have made books available to people from every background and economic condition. Fiction encourages imagination and creativity, while biographies teach valuable life lessons through the experiences of successful individuals who overcame challenges. Newspapers and educational magazines help readers stay informed about current events and important developments happening around the world. Students preparing for competitive examinations benefit greatly from regular reading because it improves comprehension, concentration, analytical thinking, and overall academic performance. Parents who encourage reading at home create a positive learning environment for children that supports their growth. Developing the habit at an early age builds confidence and curiosity that continue throughout life and help in achieving goals. Although technology has changed the way people consume information through various digital means, books remain one of the most reliable sources of knowledge and wisdom. Choosing meaningful content and reading consistently can improve both personal and professional growth, making reading a lifelong investment in education and self-development that brings immense satisfaction.`,

    medium: `Technology has transformed the way students learn and teachers deliver education in modern times. Traditional classrooms that once depended only on blackboards and printed books now use smart boards, online learning platforms, digital assignments, and interactive educational software that make classes lively. These improvements have made learning more engaging and accessible for students living in both urban and rural areas across the country. Educational videos, virtual classrooms, and recorded lectures allow learners to revise topics whenever necessary, reducing dependence on physical attendance alone and providing flexibility. Teachers now act not only as instructors but also as mentors who help students evaluate information, develop critical thinking, and solve practical problems effectively. Government institutions across the country have introduced computer education and digital literacy as essential parts of the curriculum because most workplaces now require employees to use technology confidently and efficiently. Typing proficiency, document preparation, spreadsheet management, and basic internet skills are increasingly becoming standard qualifications for many government and private sector jobs in various fields. Online examinations, digital certificates, and electronic document verification have significantly reduced paperwork while improving efficiency and transparency in administrative processes. However, responsible use of technology is equally important to avoid negative effects. Students should balance screen time with reading physical books, physical activity, outdoor sports, and face-to-face communication with family and friends. Schools also educate learners about online safety, cyber security, ethical use of digital resources, and ways to protect personal information from threats. Continuous learning has become easier than ever because educational content is available through mobile phones, computers, and online libraries at any time. Individuals who regularly update their technical skills remain competitive in today's rapidly changing job market and adapt quickly to new challenges. Lifelong learning, supported by technology and disciplined practice, has become one of the strongest foundations for career growth, professional success, personal development, and overall well-being in society.`,

    hard: `Artificial intelligence is steadily transforming modern workplaces, including government departments, educational institutions, healthcare systems, financial organizations, and private businesses across various sectors. Tasks that once required significant manual effort, such as document verification, appointment scheduling, data entry, report generation, and preliminary application screening, can now be completed more efficiently with the assistance of intelligent software systems and advanced algorithms. This technological progress allows employees to dedicate more time to decision-making, problem-solving, creative tasks, and public service instead of repetitive administrative work that consumes hours. Despite these advantages, the adoption of artificial intelligence introduces important responsibilities related to transparency, accountability, privacy, and data security that cannot be ignored. Government agencies handling sensitive citizen information must ensure that automated systems operate fairly, accurately, and without discrimination based on any factors. Employees working alongside these technologies require continuous training to understand new software, recognize potential errors, maintain human oversight whenever necessary, and make ethical decisions. Digital literacy has therefore become an essential professional skill rather than an optional qualification for everyone in the workforce. Competence in typing, document formatting, spreadsheet management, email communication, and online collaboration remains fundamental because nearly every administrative process now depends on electronic records and digital systems. Competitive examinations increasingly evaluate candidates on computer awareness and typing speed to ensure they can perform effectively in digital workplaces and contribute productively. Organizations also encourage continuous learning through workshops, online certification programs, and professional development courses that keep employees updated with emerging technologies and industry trends. While automation improves efficiency and reduces costs, human qualities such as creativity, ethical judgment, empathy, emotional intelligence, and communication continue to play an irreplaceable role in public administration and business management. The future workforce will succeed by combining technical knowledge with adaptability, critical thinking, teamwork abilities, and a willingness to learn throughout their careers. Individuals who embrace innovation while maintaining strong foundational skills will be better prepared to contribute meaningfully to modern organizations and to serve society with greater efficiency, accuracy, and responsibility in an increasingly digital world full of opportunities and challenges.`
},

     hindi: {
    easy: `भारत अपनी समृद्ध संस्कृति, विविध परंपराओं और अनेक भाषाओं के कारण पूरे विश्व में विशेष पहचान रखता है। यहाँ विभिन्न धर्मों, रीति-रिवाजों और जीवन शैलियों के लोग आपसी सम्मान और सहयोग के साथ सद्भावपूर्वक रहते हैं। प्रत्येक राज्य की अपनी अलग संस्कृति, वेशभूषा, भोजन और लोककला है, जो भारत की सांस्कृतिक धरोहर को और भी समृद्ध बनाती है तथा पर्यटकों को आकर्षित करती है। दीपावली, होली, ईद, क्रिसमस, गुरुपर्व और अन्य अनेक त्योहार लोगों को एक-दूसरे के निकट लाते हैं तथा सामाजिक सद्भाव को मजबूत करते हैं। विद्यालयों में विद्यार्थियों को हमारी सांस्कृतिक विरासत, राष्ट्रीय प्रतीकों और महान व्यक्तित्वों के बारे में पढ़ाया जाता है ताकि उनमें देश के प्रति सम्मान और जिम्मेदारी की भावना विकसित हो सके तथा वे अच्छे नागरिक बनें। परिवार में बड़े-बुजुर्ग बच्चों को नैतिक मूल्यों, अनुशासन और ईमानदारी का महत्व समझाते हैं जो उनके चरित्र निर्माण में सहायक होते हैं। पुस्तकों का अध्ययन, अच्छे विचारों का पालन और नियमित अभ्यास व्यक्ति के व्यक्तित्व को निखारते हैं तथा ज्ञान की वृद्धि करते हैं। अपनी संस्कृति का सम्मान करते हुए आधुनिक शिक्षा और विज्ञान को अपनाना समय की आवश्यकता है। यही संतुलन व्यक्ति को सफल, जागरूक और जिम्मेदार नागरिक बनने में सहायता करता है तथा समाज के विकास में योगदान देता है। भारत की यही विविधता, एकता और सांस्कृतिक समृद्धि उसे विश्व के सबसे महान देशों में स्थान दिलाती है तथा गर्व की भावना जगाती है।`,

    medium: `प्रौद्योगिकी ने शिक्षा के क्षेत्र में अभूतपूर्व परिवर्तन किया है। आज विद्यार्थी कंप्यूटर, इंटरनेट और डिजिटल संसाधनों की सहायता से देश और दुनिया की जानकारी बहुत कम समय में प्राप्त कर सकते हैं। ऑनलाइन कक्षाएँ, वीडियो व्याख्यान, डिजिटल पुस्तकालय और अभ्यास परीक्षाएँ सीखने की प्रक्रिया को अधिक सरल, प्रभावी और रोचक बना रही हैं। ग्रामीण क्षेत्रों के विद्यार्थियों को भी अब गुणवत्तापूर्ण शिक्षा तक पहुँचने के नए अवसर मिल रहे हैं जो पहले सीमित थे। शिक्षक केवल जानकारी देने वाले व्यक्ति नहीं रहे, बल्कि वे विद्यार्थियों का मार्गदर्शन करने वाले सलाहकार की भूमिका निभा रहे हैं तथा व्यक्तिगत ध्यान देते हैं। सरकारी संस्थानों ने भी डिजिटल साक्षरता, कंप्यूटर प्रशिक्षण और टंकण कौशल को शिक्षा का महत्वपूर्ण भाग बनाया है क्योंकि अधिकांश सरकारी तथा निजी कार्यालयों में कार्य अब कंप्यूटर आधारित हो चुका है। दस्तावेज़ तैयार करना, ईमेल भेजना, ऑनलाइन आवेदन भरना और डिजिटल अभिलेखों का प्रबंधन दैनिक कार्यों का हिस्सा बन चुके हैं। इसलिए विद्यार्थियों को नियमित रूप से टाइपिंग का अभ्यास करने, कंप्यूटर के मूलभूत ज्ञान को मजबूत करने और नई तकनीकों को सीखने की सलाह दी जाती है। साथ ही उन्हें इंटरनेट का सुरक्षित और जिम्मेदारीपूर्ण उपयोग, साइबर सुरक्षा तथा व्यक्तिगत जानकारी की सुरक्षा के बारे में भी जागरूक किया जाता है ताकि वे सुरक्षित रहें। आधुनिक शिक्षा का उद्देश्य केवल परीक्षा उत्तीर्ण करना नहीं बल्कि ऐसे सक्षम, आत्मविश्वासी और तकनीकी रूप से दक्ष नागरिक तैयार करना है जो बदलती दुनिया की आवश्यकताओं के अनुसार स्वयं को निरंतर विकसित कर सकें तथा राष्ट्र की प्रगति में योगदान दें।`,

    hard: `भविष्य की दुनिया में कृत्रिम बुद्धिमत्ता, स्वचालन और डिजिटल प्रौद्योगिकी का प्रभाव लगभग प्रत्येक क्षेत्र में स्पष्ट रूप से दिखाई देगा। सरकारी विभाग, बैंक, शैक्षणिक संस्थान, स्वास्थ्य सेवाएँ तथा निजी कंपनियाँ दस्तावेज़ों के सत्यापन, डेटा विश्लेषण, समय-निर्धारण, आवेदन पत्रों की प्रारंभिक जाँच तथा अन्य प्रशासनिक कार्यों के लिए आधुनिक स्वचालित प्रणालियों का उपयोग तेजी से बढ़ा रही हैं। इससे कार्यों की गति बढ़ती है, त्रुटियाँ कम होती हैं और नागरिकों को सेवाएँ पहले की अपेक्षा अधिक शीघ्र प्राप्त होती हैं। हालांकि इस परिवर्तन के साथ डेटा सुरक्षा, गोपनीयता, पारदर्शिता और जवाबदेही जैसे महत्वपूर्ण प्रश्न भी जुड़े हुए हैं जिनका समाधान आवश्यक है। किसी भी स्वचालित प्रणाली की विश्वसनीयता सुनिश्चित करने के लिए प्रशिक्षित कर्मचारियों की आवश्यकता बनी रहती है जो परिणामों का परीक्षण कर सकें और आवश्यकतानुसार उचित निर्णय ले सकें। इसलिए आज के समय में डिजिटल साक्षरता, कंप्यूटर संचालन, दस्तावेज़ प्रबंधन, ईमेल संचार, स्प्रेडशीट का उपयोग तथा तेज़ और शुद्ध टंकण जैसी क्षमताएँ प्रत्येक कर्मचारी के लिए अत्यंत महत्वपूर्ण हो गई हैं। विभिन्न प्रतियोगी परीक्षाओं में भी कंप्यूटर ज्ञान और टंकण दक्षता का मूल्यांकन किया जाता है ताकि अभ्यर्थी आधुनिक कार्यालयों में प्रभावी ढंग से कार्य कर सकें। नई तकनीकों को अपनाने के साथ-साथ निरंतर सीखते रहना, नैतिक मूल्यों का पालन करना, समस्या समाधान की क्षमता विकसित करना और टीम के साथ प्रभावी संवाद बनाए रखना भी समान रूप से आवश्यक है। जो व्यक्ति तकनीकी ज्ञान के साथ अनुशासन, ईमानदारी, सटीकता और सीखने की इच्छा बनाए रखते हैं, वे भविष्य के डिजिटल कार्यस्थलों में अधिक सफल सिद्ध होंगे तथा समाज और राष्ट्र के विकास में महत्वपूर्ण योगदान देंगे।
    प्रौद्योगिकी ने शिक्षा के क्षेत्र में अभूतपूर्व परिवर्तन किया है। आज विद्यार्थी कंप्यूटर, इंटरनेट और डिजिटल संसाधनों की सहायता से देश और दुनिया की जानकारी बहुत कम समय में प्राप्त कर सकते हैं। ऑनलाइन कक्षाएँ, वीडियो व्याख्यान, डिजिटल पुस्तकालय और अभ्यास परीक्षाएँ सीखने की प्रक्रिया को अधिक सरल, प्रभावी और रोचक बना रही हैं। ग्रामीण क्षेत्रों के विद्यार्थियों को भी अब गुणवत्तापूर्ण शिक्षा तक पहुँचने के नए अवसर मिल रहे हैं जो पहले सीमित थे। शिक्षक केवल जानकारी देने वाले व्यक्ति नहीं रहे, बल्कि वे विद्यार्थियों का मार्गदर्शन करने वाले सलाहकार की भूमिका निभा रहे हैं तथा व्यक्तिगत ध्यान देते हैं। सरकारी संस्थानों ने भी डिजिटल साक्षरता, कंप्यूटर प्रशिक्षण और टंकण कौशल को शिक्षा का महत्वपूर्ण भाग बनाया है क्योंकि अधिकांश सरकारी तथा निजी कार्यालयों में कार्य अब कंप्यूटर आधारित हो चुका है। दस्तावेज़ तैयार करना, ईमेल भेजना, ऑनलाइन आवेदन भरना और डिजिटल अभिलेखों का प्रबंधन दैनिक कार्यों का हिस्सा बन चुके हैं। इसलिए विद्यार्थियों को नियमित रूप से टाइपिंग का अभ्यास करने, कंप्यूटर के मूलभूत ज्ञान को मजबूत करने और नई तकनीकों को सीखने की सलाह दी जाती है। साथ ही उन्हें इंटरनेट का सुरक्षित और जिम्मेदारीपूर्ण उपयोग, साइबर सुरक्षा तथा व्यक्तिगत जानकारी की सुरक्षा के बारे में भी जागरूक किया जाता है ताकि वे सुरक्षित रहें। आधुनिक शिक्षा का उद्देश्य केवल परीक्षा उत्तीर्ण करना नहीं बल्कि ऐसे सक्षम, आत्मविश्वासी और तकनीकी रूप से दक्ष नागरिक तैयार करना है जो बदलती दुनिया की आवश्यकताओं के अनुसार स्वयं को निरंतर विकसित कर सकें तथा राष्ट्र की प्रगति में योगदान दें।`,

}
}

interface TestResult {
    candidateId: string
    timestamp: string
    date: string
    time: string
    language: string
    difficulty: string
    grossSpeed: string
    netSpeed: string
    accuracy: string
    keyDepressions: number
    totalTyped: number
    correctChars: number
    wrongChars: number
    qualification: string
    timeUsed: number
    examId: string
    centreCode: string
}

const STORAGE_KEY = "typingTestSession"

 

const generateCandidateId = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(5, "0")
    return `CAND${year}${random}`
}

const generateExamId = (index: number) => {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, "0")
    const day = String(new Date().getDate()).padStart(2, "0")
    return `EXAM${year}${month}${day}${String(index + 1).padStart(3, "0")}`
}

const generateCentreCode = () => {
    return `CENTRE${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`
}
 

export default function PracticePage() {
    // Setup
    const [language, setLanguage] = useState<Language>("english")
    const [difficulty, setDifficulty] = useState<Difficulty>("easy")
    const [fontId, setFontId] = useState<FontId>("mangal")
    const [candidateId, setCandidateId] = useState("")

    // Test state
    const [timeLimit, setTimeLimit] = useState(DIFFICULTY_LEVELS.easy.duration)
    const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS.easy.duration * 60)
    const [started, setStarted] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState("")
    const [text, setText] = useState("")

    // Metrics
    const [keyDepressions, setKeyDepressions] = useState(0)
    const [backspaceCount, setBackspaceCount] = useState(0)
    const [liveErrors, setLiveErrors] = useState(0)

    // Session history
    const [results, setResults] = useState<TestResult[]>([])
    const [showResults, setShowResults] = useState(false)
    const [centreCode] = useState(generateCentreCode())

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const requiredKeys = timeLimit * KEYS_PER_MINUTE_TARGET
    const fontFamily = HINDI_FONT_OPTIONS.find((f) => f.id === fontId)?.family ?? HINDI_FONT_OPTIONS[0].family

   

    useEffect(() => {
        const newCandidateId = generateCandidateId()
        setCandidateId(newCandidateId)
        try {
            window.localStorage.removeItem(STORAGE_KEY)
        } catch {
            // ignore
        }
    }, [])

    const persistSession = useCallback((nextResults: TestResult[]) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ results: nextResults, candidateId }))
        } catch {
            // storage unavailable
        }
    }, [candidateId])

 

    const generateText = useCallback(async () => {
        setLoading(true)
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
            if (!apiKey) throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY")

            const topicEnglish =
                difficulty === "easy" ? "the benefits of reading" : difficulty === "medium" ? "technology in education" : "artificial intelligence and the future of work"
            const topicHindi =
                difficulty === "easy" ? "भारत की संस्कृति" : difficulty === "medium" ? "प्रौद्योगिकी और शिक्षा" : "भविष्य की दुनिया और कृत्रिम बुद्धिमत्ता"

            const prompt =
                language === "english"
                    ? `Write 3-4 plain, clear paragraphs (300-320 words total) about "${topicEnglish}", suitable as a typing-test passage. Plain prose only, no headings, no markdown, no bullet points.`
                    : `निम्नलिखित विषय पर शुद्ध हिंदी (यूनिकोड) में 3-4 सरल अनुच्छेद लिखें (कुल 300-320 शब्द), जो टंकण अभ्यास हेतु उपयुक्त हों: "${topicHindi}"। कोई शीर्षक, मार्कडाउन या बुलेट पॉइंट न दें, केवल सामान्य गद्य।`

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            )

            if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

            const data = await response.json()
            const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            if (!generated) throw new Error("Empty response from Gemini")
            setText(generated)
        } catch (error) {
            console.error("Falling back to local passage:", error)
            setText(FALLBACK_TEXTS[language][difficulty])
        } finally {
            setLoading(false)
        }
    }, [language, difficulty])

    useEffect(() => {
        generateText()
    }, [language, difficulty, generateText])

    /* ================================================================ */
    /*  TIMER                                                          */
    /* ================================================================ */

    useEffect(() => {
        if (started && timeLeft > 0 && !submitted) {
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
    }, [started, submitted])


    const handleChange = (value: string) => {
        if (!started && value.length > 0) setStarted(true)
        setKeyDepressions((prev) => prev + 1)
        setInput(value)
        const correct = value.split("").filter((char, i) => char === text[i]).length
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

        const totalTyped = input.length
        const correctChars = input.split("").filter((char, i) => char === text[i]).length
        const wrongChars = totalTyped - correctChars
        const minutesUsed = Math.max((timeLimit * 60 - timeLeft) / 60, 0.01)

        const grossSpeed = (keyDepressions / 5 / minutesUsed).toFixed(2)
        const errorPenalty = (wrongChars / 5).toFixed(2)
        const netSpeed = Math.max(Number(grossSpeed) - Number(errorPenalty), 0).toFixed(2)
        const accuracy = totalTyped === 0 ? "100" : ((correctChars / totalTyped) * 100).toFixed(2)
        const qualification = keyDepressions >= requiredKeys ? "Qualified" : "Not Qualified"
        const now = new Date()
        const date = now.toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" })
        const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

        const result: TestResult = {
            candidateId,
            timestamp: now.toLocaleString("en-IN"),
            date,
            time,
            language: language.toUpperCase(),
            difficulty: difficulty.toUpperCase(),
            grossSpeed: `${grossSpeed} WPM`,
            netSpeed: `${netSpeed} WPM`,
            accuracy: `${accuracy}%`,
            keyDepressions,
            totalTyped,
            correctChars,
            wrongChars,
            qualification,
            timeUsed: Math.floor((timeLimit * 60 - timeLeft) / 60),
            examId: generateExamId(results.length),
            centreCode,
        }

        const nextResults = [result, ...results].slice(0, 20)
        setResults(nextResults)
        persistSession(nextResults)
        setShowResults(true)
    }

    const handleRetake = () => {
        setStarted(false)
        setSubmitted(false)
        setInput("")
        setKeyDepressions(0)
        setBackspaceCount(0)
        setLiveErrors(0)
        setTimeLeft(timeLimit * 60)
        setShowResults(false)
        generateText()
        setTimeout(() => textareaRef.current?.focus(), 100)
    }

    const handleDifficultyChange = (next: Difficulty) => {
        setDifficulty(next)
        const duration = DIFFICULTY_LEVELS[next].duration
        setTimeLimit(duration)
        setTimeLeft(duration * 60)
    }


    const totalTyped = input.length
    const correctChars = input.split("").filter((char, i) => char === text[i]).length
    const wrongChars = totalTyped - correctChars
    const minutesUsed = Math.max((timeLimit * 60 - timeLeft) / 60, 0.01)
    const grossSpeed = (keyDepressions / 5 / minutesUsed).toFixed(2)
    const errorPenalty = (wrongChars / 5).toFixed(2)
    const netSpeed = Math.max(Number(grossSpeed) - Number(errorPenalty), 0).toFixed(2)
    const accuracy = totalTyped === 0 ? "100" : ((correctChars / totalTyped) * 100).toFixed(2)
    const qualified = keyDepressions >= requiredKeys
    const minutesLabel = String(Math.floor(timeLeft / 60)).padStart(2, "0")
    const secondsLabel = String(timeLeft % 60).padStart(2, "0")
    const timeCritical = started && !submitted && timeLeft <= 30

    const latestResult = results.length > 0 ? results[0] : null

    return (
        <div className="min-h-screen bg-[#F6F4EE] text-[#1B2A4A] dark:bg-[#10141C] dark:text-[#E8E4DA]">
            <main className="mx-auto max-w-9xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">

                    <div className="space-y-2 lg:col-span-2">


                        <motion.section
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="rounded-sm border mt-15 border-[#1B2A4A]/15 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#161B26] sm:p-6"
                        >
                            <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
                                <FileText className="h-5 w-5 text-[#1B2A4A] dark:text-[#E8E4DA]" /> Exam Configuration
                            </h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                <div>
                                    <label className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                        <Languages className="h-3.5 w-3.5" /> Language
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setLanguage("english")}
                                            disabled={started}
                                            className={`flex-1 rounded-sm border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${language === "english"
                                                ? "border-[#1B2A4A] bg-[#1B2A4A] text-white dark:border-[#E8E4DA] dark:bg-[#E8E4DA] dark:text-[#10141C]"
                                                : "border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A]/5 dark:border-white/15 dark:text-[#E8E4DA] dark:hover:bg-white/5"
                                                }`}
                                        >
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLanguage("hindi")}
                                            disabled={started}
                                            className={`flex-1 rounded-sm border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${language === "hindi"
                                                ? "border-[#1B2A4A] bg-[#1B2A4A] text-white dark:border-[#E8E4DA] dark:bg-[#E8E4DA] dark:text-[#10141C]"
                                                : "border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A]/5 dark:border-white/15 dark:text-[#E8E4DA] dark:hover:bg-white/5"
                                                }`}
                                        >
                                            हिंदी
                                        </button>
                                    </div>
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
                                        disabled={started}
                                        className="w-full rounded-sm border border-[#1B2A4A]/20 bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#10141C] dark:text-[#E8E4DA]"
                                    >
                                        {Object.entries(DIFFICULTY_LEVELS).map(([key, val]) => (
                                            <option key={key} value={key}>
                                                {val.label} — {val.note}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Hindi font */}
                                {language === "hindi" ? (
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                            Typeface
                                        </label>
                                        <select
                                            value={fontId}
                                            onChange={(e) => setFontId(e.target.value as FontId)}
                                            disabled={started}
                                            className="w-full rounded-sm border border-[#1B2A4A]/20 bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#10141C] dark:text-[#E8E4DA]"
                                        >
                                            {HINDI_FONT_OPTIONS.map((f) => (
                                                <option key={f.id} value={f.id}>
                                                    {f.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-end gap-1 text-xs text-[#5B6472] dark:text-[#9AA3B2]">
                                        <span className="font-semibold uppercase tracking-wide">Qualifying Limit</span>
                                        <span className="font-mono font-bold">{requiredKeys.toLocaleString("en-IN")} keys</span>
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Live dashboard */}
                        <motion.section
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                        >
                            {[
                                { label: "Key Depressions", value: keyDepressions },
                                { label: "Live Errors", value: liveErrors },
                                { label: "Backspace Count", value: backspaceCount },
                                { label: "Required Keys", value: requiredKeys.toLocaleString("en-IN") },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    className="rounded-sm border border-[#1B2A4A]/15 bg-white p-2 text-center dark:border-white/10 dark:bg-[#161B26]"
                                >
                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                        {m.label}
                                    </div>
                                    <div className="font-mono text-2xl font-bold tabular-nums text-[#1B2A4A] dark:text-[#E8E4DA]">{m.value}</div>
                                </div>
                            ))}
                        </motion.section>
                        <motion.section
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className=" relative h-50 -mt-1 overflow-y-auto rounded-sm border border-[#1B2A4A]/10 bg-[#FBFAF6] p-2 text-base leading-8 scroll-smooth dark:border-white/10 dark:bg-[#10141C] sm:text-lg rounded-sm border border-[#1B2A4A]/15 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#161B26] sm:p-6"
                        >
                            <h3 className="-mt-4 font-serif text-base font-semibold p-1  ">Passage to Type</h3>

                            <div
                                style={{ fontFamily: language === "hindi" ? fontFamily : undefined }}
                                className=" select-none overflow-auto rounded-sm border border-[#1B2A4A]/10 bg-[#FBFAF6] p-2 text-base leading-8 dark:border-white/10 dark:bg-[#10141C] sm:text-lg"
                            >
                                {loading ? (
                                    <div className="flex h-20 items-center justify-center">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                                            className="h-8 w-8 rounded-full border-3 border-[#1B2A4A]/20 border-t-[#1B2A4A] dark:border-white/15 dark:border-t-white"
                                        />
                                    </div>
                                ) : (
                                    text.split("").map((char, index) => {
                                        let cls = "text-[#3A4256] dark:text-[#C8C2B4]"
                                        if (index < input.length) {
                                            cls =
                                                input[index] === char
                                                    ? "text-[#2F6B4F] font-medium dark:text-[#7BC9A0]"
                                                    : "text-[#8C2F39] font-medium underline dark:text-[#E0918C]"
                                        } else if (index === input.length) {
                                            cls = "bg-[#B08D2B]/80 text-white"
                                        }
                                        return (
                                            <span key={index} className={cls}>
                                                {char}
                                            </span>
                                        )
                                    })
                                )}
                            </div>
                        </motion.section>

                        {/* Typing area */}
                        <motion.section
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="rounded-sm border border-[#1B2A4A]/15 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#161B26] sm:p-6"
                        >
                            <h3 className="mb-3 font-serif text-base font-semibold">Answer Sheet</h3>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                disabled={submitted || loading}
                                onChange={(e) => handleChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Click here and begin typing — the timer starts on your first keystroke."
                                style={{ fontFamily: language === "hindi" ? fontFamily : undefined }}
                                className="h-40 w-full resize-none rounded-sm border-2 border-[#1B2A4A]/20 bg-[#FBFAF6] p-4 font-mono text-base focus:border-[#1B2A4A] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-[#10141C] dark:text-[#E8E4DA] dark:focus:border-white/40"
                            />
                        </motion.section>

                        {/* Result Certificate */}
                        <AnimatePresence>
                            {submitted && showResults && latestResult && (
                                <motion.section
                                    id="result-card"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    className="relative overflow-hidden rounded-sm border-2 border-[#1B2A4A]/25 bg-gradient-to-br from-[#FBFAF6] to-white p-6 shadow-lg dark:border-white/15 dark:from-[#161B26] dark:to-[#10141C] sm:p-8"
                                >
                                    {/* Certificate Header */}
                                    <div className="mb-6 border-b-2 border-dashed border-[#1B2A4A]/20 pb-6 dark:border-white/15">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <h2 className="flex items-center gap-2 font-serif text-2xl font-bold sm:text-3xl">
                                                    <Award className="h-6 w-6 text-[#2F6B4F]" /> Typing Proficiency Certificate
                                                </h2>
                                                <p className="mt-1 text-xs text-[#5B6472] dark:text-[#9AA3B2]">Issued by Government Typing Test Portal</p>
                                            </div>

                                        </div>

                                        {/* Certification Info */}
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">


                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                                    Exam Date
                                                </p>
                                                <p className="font-mono text-sm font-bold">{latestResult.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                                    Exam Time
                                                </p>
                                                <p className="font-mono text-sm font-bold">{latestResult.time}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results Grid */}
                                    <div className="mb-6">
                                        <h3 className="mb-4 font-serif text-lg font-semibold">Typing Test Results</h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                { label: "Net Speed (WPM)", value: latestResult.netSpeed, highlight: true },
                                                { label: "Gross Speed (WPM)", value: latestResult.grossSpeed },
                                                { label: "Accuracy", value: latestResult.accuracy },
                                                { label: "Total Characters Typed", value: `${latestResult.totalTyped}` },
                                                { label: "Correct Characters", value: `${latestResult.correctChars}` },
                                                { label: "Error Characters", value: `${latestResult.wrongChars}` },
                                                { label: "Key Depressions", value: `${latestResult.keyDepressions}` },
                                                { label: "Error Penalty (WPM)", value: errorPenalty },
                                                { label: "Time Duration", value: `${latestResult.timeUsed} min` },
                                            ].map((row) => (
                                                <div
                                                    key={row.label}
                                                    className={`rounded-sm border p-4 ${row.highlight
                                                        ? "border-[#2F6B4F]/30 bg-[#E8F5F1] dark:border-[#7BC9A0]/30 dark:bg-[#0A3D2F]/40"
                                                        : "border-[#1B2A4A]/15 bg-white dark:border-white/10 dark:bg-[#10141C]"
                                                        }`}
                                                >
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                                        {row.label}
                                                    </div>
                                                    <div className={`font-mono text-2xl font-bold tabular-nums ${row.highlight ? "text-[#2F6B4F] dark:text-[#7BC9A0]" : ""
                                                        }`}>
                                                        {row.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Marked Answer Sheet */}
                                    <div className="mb-6 rounded-sm border border-[#1B2A4A]/15 bg-white p-4 dark:border-white/10 dark:bg-[#10141C]">
                                        <h3 className="mb-3 font-semibold">Transcribed Text (Marked Answer)</h3>
                                        <div
                                            style={{ fontFamily: language === "hindi" ? fontFamily : undefined }}
                                            className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words rounded-sm border border-[#1B2A4A]/10 bg-[#FBFAF6] p-4 text-sm leading-7 dark:border-white/10 dark:bg-[#0A0E16]"
                                        >
                                            {text.split("").map((char, index) => {
                                                if (index >= input.length) return null
                                                return (
                                                    <span
                                                        key={index}
                                                        className={
                                                            input[index] === char
                                                                ? "text-[#2F6B4F] font-semibold dark:text-[#7BC9A0]"
                                                                : "bg-[#8C2F39]/10 text-[#8C2F39] underline dark:bg-[#E0918C]/10 dark:text-[#E0918C]"
                                                        }
                                                    >
                                                        {input[index]}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Exam Details Footer */}
                                    <div className="mb-6 grid grid-cols-2 gap-3 border-t border-dashed border-[#1B2A4A]/20 pt-4 sm:grid-cols-4 dark:border-white/15">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                                Language
                                            </p>
                                            <p className="font-mono text-sm font-bold">{latestResult.language}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                                Difficulty
                                            </p>
                                            <p className="font-mono text-sm font-bold">{latestResult.difficulty}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                                Status
                                            </p>
                                            <p
                                                className={`font-mono text-sm font-bold flex items-center gap-1 ${latestResult.qualification === "Qualified"
                                                    ? "text-[#2F6B4F]"
                                                    : "text-[#8C2F39]"
                                                    }`}
                                            >
                                                {latestResult.qualification === "Qualified" ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                                {latestResult.qualification}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6472] dark:text-[#9AA3B2]">
                                                Required Keys
                                            </p>
                                            <p className="font-mono text-sm font-bold">{requiredKeys.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>

                                    {/* Qualification Stamp */}
                                    <div
                                        className={`pointer-events-none absolute right-4 top-48 rotate-16 select-none rounded-sm border-4 px-6 py-2 text-sm font-bold uppercase tracking-widest sm:right-8 ${latestResult.qualification === "Qualified"
                                            ? "border-[#2F6B4F] text-[#2F6B4F]"
                                            : "border-[#8C2F39] text-[#8C2F39]"
                                            }`}
                                        style={{ opacity: 0.75 }}
                                    >
                                        {latestResult.qualification === "Qualified" ? "✓ Qualified" : "✗ Not Qualified"}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-8 flex flex-wrap gap-2 border-t border-dashed border-[#1B2A4A]/20 pt-4 dark:border-white/15">
                                        <button
                                            onClick={() => window.print()}
                                            className="flex items-center gap-2 rounded-sm bg-[#1B2A4A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16213B] dark:bg-[#E8E4DA] dark:text-[#10141C] dark:hover:bg-white"
                                        >
                                            <Printer className="h-4 w-4" /> Print Certificate
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement("a")
                                                link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
                                                    `TYPING TEST RESULT\n\nCandidate ID: ${latestResult.candidateId}\nExam ID: ${latestResult.examId}\nCentre Code: ${latestResult.centreCode}\n\nNet Speed: ${latestResult.netSpeed}\nGross Speed: ${latestResult.grossSpeed}\nAccuracy: ${latestResult.accuracy}\nStatus: ${latestResult.qualification}\n\nDate: ${latestResult.date}\nTime: ${latestResult.time}`
                                                )}`
                                                link.download = `typing_result_${latestResult.examId}.txt`
                                                link.click()
                                            }}
                                            className="flex items-center gap-2 rounded-sm border border-[#1B2A4A]/30 px-4 py-2 text-sm font-semibold text-[#1B2A4A] transition hover:bg-[#1B2A4A]/5 dark:border-white/30 dark:text-[#E8E4DA] dark:hover:bg-white/5"
                                        >
                                            <Download className="h-4 w-4" /> Download Result
                                        </button>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>

               
                    {/* SIDEBAR                                                    */}
                   
                    <motion.aside
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="h-fit space-y-5 mt-15 lg:sticky lg:top-6"
                    >
                        {/* Timer Section */}
                        <section className="rounded-sm border border-[#1B2A4A]/15 bg-white p-5 dark:border-white/10 dark:bg-[#161B26]">
                            <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-semibold">
                                <ClockAlertIcon className="h-4 w-4" /> Exam Timer
                            </h3>
                            <div
                                className={`flex w-full items-center justify-center gap-2 rounded-sm border-2 px-4 py-4 font-mono text-3xl font-bold tabular-nums transition-colors ${timeCritical
                                    ? "border-[#8C2F39] bg-[#8C2F39] text-white"
                                    : "border-[#1B2A4A]/20 bg-[#1B2A4A]/5 text-[#1B2A4A] dark:border-white/15 dark:bg-white/5 dark:text-[#E8E4DA]"
                                    }`}
                            >
                                <Clock className="h-6 w-6" />
                                {minutesLabel}:{secondsLabel}
                            </div>
                            {timeCritical && (
                                <p className="mt-2 text-xs font-semibold text-[#8C2F39] dark:text-[#E0918C]">⚠ Time critical: 30 seconds or less</p>
                            )}
                        </section>

                        {/* Session History */}
                        <section className="rounded-sm border border-[#1B2A4A]/15 bg-white p-5 dark:border-white/10 dark:bg-[#161B26]">
                            <h2 className="mb-1 flex items-center gap-2 font-serif text-base font-semibold">
                                <TrendingUp className="h-4 w-4" /> Session History
                            </h2>
                            <p className="mb-4 text-xs text-[#5B6472] dark:text-[#9AA3B2]">Session attempts — cleared on page refresh</p>

                            {results.length === 0 ? (
                                <p className="py-6 text-center text-sm text-[#5B6472] dark:text-[#9AA3B2]">No test attempts yet</p>
                            ) : (
                                <div className="max-h-96 space-y-2 overflow-y-auto">
                                    {results.map((r, i) => (
                                        <div
                                            key={i}
                                            className="rounded-sm border border-[#1B2A4A]/10 bg-[#FBFAF6] p-3 text-sm dark:border-white/10 dark:bg-[#10141C]"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="font-mono font-bold text-[#1B2A4A] dark:text-[#E8E4DA]">{r.netSpeed}</span>
                                                <span
                                                    className={`flex items-center gap-1 text-xs font-semibold ${r.qualification === "Qualified"
                                                        ? "text-[#2F6B4F]"
                                                        : "text-[#8C2F39]"
                                                        }`}
                                                >
                                                    {r.qualification === "Qualified" ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 text-xs text-[#5B6472] dark:text-[#9AA3B2]">
                                                <span>{r.language}</span>
                                                <span>{r.difficulty}</span>
                                                <span>Acc {r.accuracy}</span>
                                                <span className="font-mono">{r.examId}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            window.localStorage.removeItem(STORAGE_KEY)
                                        } catch {
                                            /* ignore */
                                        }
                                        setResults([])
                                    }}
                                    className="mt-4 w-full rounded-sm border border-[#8C2F39]/40 py-2 text-sm font-semibold text-[#8C2F39] transition hover:bg-[#8C2F39]/5 dark:border-[#E0918C]/40 dark:text-[#E0918C]"
                                >
                                    Clear History
                                </button>
                            )}
                        </section>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <motion.button
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                    handleSubmit()
                                    setTimeout(() => {
                                        document
                                            .getElementById("result-card")
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            })
                                    }, 300)
                                }}
                                disabled={loading || !started}
                                className="w-full rounded-sm bg-[#1B2A4A] py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#16213B] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#E8E4DA] dark:text-[#10141C] dark:hover:bg-white"
                            >
                                Submit Test
                            </motion.button>

                            {submitted && (
                                <motion.button
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleRetake}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full flex items-center justify-center gap-2 rounded-sm border border-[#1B2A4A]/30 py-3 text-sm font-semibold text-[#1B2A4A] transition hover:bg-[#1B2A4A]/5 dark:border-white/30 dark:text-[#E8E4DA] dark:hover:bg-white/5"
                                >
                                    <RotateCcw className="h-4 w-4" /> Retake Test
                                </motion.button>
                            )}
                        </div>
                    </motion.aside>
                </div>
            </main>
        </div>
    )
}
