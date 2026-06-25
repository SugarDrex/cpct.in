 
import Script from "next/script";
 

const faqs = [
  {
    question: "What is CPCT?",
    answer:
      "CPCT (Computer Proficiency Certification Test) is an exam conducted in Madhya Pradesh to assess computer skills and typing speed for government job eligibility.",
  },
  {
    question: "What is the passing criteria for CPCT exam?",
    answer:
      "Candidates must score qualifying marks in multiple choice questions and achieve minimum typing speed in Hindi or English to pass the CPCT exam.",
  },
  {
    question: "How can I prepare for CPCT exam 2026?",
    answer:
      "You can prepare by practicing mock tests, improving typing speed, studying previous year papers and reviewing updated CPCT syllabus.",
  },
  {
    question: "Does CPCT include typing test?",
    answer:
      "Yes, CPCT includes both Hindi and English typing tests along with objective computer-based questions.",
  },
  {
    question: "Is CPCT mandatory for government jobs in MP?",
    answer:
      "Yes, CPCT certification is required for many government job positions in Madhya Pradesh that involve computer work.",
  },
];

export default function FaqPage() {
  return (
   <main className="bg-gray-100 dark:bg-slate-950 py-3 px-4 md:px-8">
  <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 shadow-md border border-gray-200 dark:border-slate-800 rounded-md">
  {/* Structured Data – Only Once */}
        <Script
          id="faq-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQ",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
        />

    <div className="border-b border-gray-300 dark:border-slate-700 px-6 py-6">
      <h1 className="text-3xl md:text-4xl font-bold text-[#0f2a78] dark:text-blue-400">
        CPCT Frequently Asked Questions
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300 text-base md:text-lg">
        regarding CPCT Exam , typing practice,
        exam pattern, eligibility criteria and preparation strategy.
      </p>
    </div>

    {/* FAQ List */}
    <div className="divide-y divide-gray-200 dark:divide-slate-700">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="px-6 py-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white border-l-4 border-[#0f2a78] dark:border-blue-400 pl-4">
            {faq.question}
          </h2>

          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base pl-5">
            {faq.answer}
          </p>
        </div>
      ))}
    </div>
     
      </div>
    </main>
  );
}
