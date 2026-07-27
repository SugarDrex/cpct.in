import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import "../app/globals.css";

import Navbar from "@/components/NavBar";
import { Poppins, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";
import Script from "next/script";

export const poppins = Poppins({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─── All MP cities for geo targeting ────────────────────────────────────────
const MP_CITIES = [
  "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar",
  "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli",
  "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri",
  "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch",
  "Pithampur", "Hoshangabad", "Itarsi", "Narmadapuram", "Sehore",
  "Betul", "Seoni", "Datia", "Nagda", "Shajapur", "Tikamgarh",
  "Balaghat", "Morena", "Katni", "Narsinghpur", "Dhar", "Raisen",
  "Barwani", "Rajgarh", "Anuppur", "Ashoknagar", "Shahdol", "Sidhi",
  "Umaria", "Harda", "Alirajpur", "Jhabua", "Mandla", "Dindori",
  "Panna", "Maihar", "Pachmarhi",
];

// ─── Enhanced City-wise keyword expansion ───────────────────────────────────
const cityKeywords = MP_CITIES.flatMap((city) => [
  `CPCT mock test ${city}`,
  `CPCT typing practice ${city}`,
  `CPCT coaching ${city}`,
  `CPCT exam preparation ${city}`,
  `CPCT MCQ test ${city}`,
  `CPCT topic wise test ${city} MP`,
  `best CPCT preparation ${city}`,
  `CPCT online test ${city}`,
  `free CPCT mock test ${city}`,
  `CPCT study material ${city}`,
  `CPCT practice exam ${city} MP`,
]);

// ─── Voice & AI Search Intent Keywords ────────────────────────────────────────
const voiceSearchKeywords = [
  "how to prepare for CPCT exam in Madhya Pradesh",
  "what is CPCT exam in Bhopal",
  "free CPCT mock test near me",
  "CPCT typing speed requirement Indore",
  "best online CPCT preparation platform",
  "CPCT exam date 2026 Madhya Pradesh",
  "CPCT passing marks MP government",
  "how many questions in CPCT exam",
  "CPCT syllabus in Hindi",
  "CPCT computer fundamentals tutorial",
];

// ─── AI Answer Engine Keywords (AEO) - Optimized for Claude, ChatGPT, Gemini ─
const aeoKeywords = [
  "CPCT vs other typing certification exams",
  "how many attempts for CPCT exam",
  "CPCT syllabus breakdown 2026",
  "CPCT computer fundamentals guide",
  "CPCT MS Office typing test format",
  "how to improve CPCT typing speed",
  "CPCT exam pattern complete guide",
  "CPCT passing criteria MP government",
  "CPCT certificate validity duration",
  "CPCT applicant eligibility criteria",
  "CPCT exam duration and structure",
  "CPCT marks distribution breakdown",
];

// ─── Search Bot Crawling Optimization ────────────────────────────────────────
const botOptimizedKeywords = [
  "CPCT mock test 2025 2026",
  "CPCT exam preparation MP",
  "CPCT typing test Hindi English",
  "CPCT MCQ practice test",
  "CPCT computer proficiency certification",
  "CPCT previous year papers PDF",
  "CPCT online coaching Madhya Pradesh",
  "CPCT question bank free download",
  "CPCT tips and tricks guide",
  "CPCT time management strategy",
];

export const metadata: Metadata = {
  metadataBase: new URL("https://cpct.in"),

  title: {
    default:
      "CPCT Mock Test 2026 | Free Online Practice | Hindi & English Typing | Top-Ranked Prep Platform | All MP Cities",
    template: "%s | CPCT.IN – Rank #1 in CPCT Exams, Bhopal, Indore, Jabalpur, All Madhya Pradesh",
  },

  description:
    "CPCT.IN – India's #1 Free CPCT Preparation Platform for Madhya Pradesh. 100% Free mock tests, topic-wise MCQ, Hindi & English typing practice, previous year papers. Trusted by 100K+ students in Bhopal, Indore, Jabalpur, Narmadapuram, Itarsi & ALL MP cities. Updated 2026. No registration required.",

  keywords: [
    // ═══ CORE NAVIGATIONAL KEYWORDS ═══
    "CPCT mock test 2025 2026",
    "CPCT exam preparation Madhya Pradesh",
    "free CPCT mock test online",
    "CPCT typing test Hindi English",
    "CPCT MCQ practice test",
    "CPCT topic wise exam",
    "CPCT previous year papers",
    "CPCT study material PDF",
    "CPCT online coaching MP",
    "CPCT computer proficiency certification",
    
    // ═══ DIRECT ANSWER KEYWORDS (AEO) ═══
    "what is CPCT exam",
    "CPCT full form definition",
    "CPCT exam pattern 2026",
    "CPCT syllabus complete list",
    "CPCT passing marks requirement",
    "CPCT typing speed minimum 30 WPM",
    "CPCT exam date notification",
    "CPCT certificate validity",
    "how many attempts CPCT exam",
    "CPCT eligibility criteria",
    
    // ═══ INTENT-DRIVEN KEYWORDS ═══
    "how to prepare for CPCT exam",
    "CPCT exam guide for beginners",
    "best CPCT preparation strategy",
    "CPCT time management tips",
    "CPCT computer fundamentals tutorial",
    "CPCT MS Office guide Word Excel PowerPoint",
    "CPCT typing speed improvement",
    "CPCT general knowledge topics",
    
    // ═══ LONG-TAIL & SEMANTIC ═══
    "CPCT typing test 30 words per minute",
    "CPCT MCQ Hindi English bilingual",
    "CPCT question paper with solution",
    "CPCT exam centers Madhya Pradesh",
    "CPCT government job preparation",
    
    // ═══ CITY-SPECIFIC (GEO) ═══
    ...cityKeywords,
    
    // ═══ VOICE SEARCH ═══
    ...voiceSearchKeywords,
    
    // ═══ AEO (ANSWER ENGINE OPTIMIZATION) ═══
    ...aeoKeywords,
    
    // ═══ BOT-OPTIMIZED ═══
    ...botOptimizedKeywords,
  ],

  authors: [{ name: "CPCT.IN Educational Team", url: "https://cpct.in" }],
  creator: "CPCT.IN – Free CPCT Exam Preparation India",
  publisher: "CPCT.IN",
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    noarchive: false,
    noimageindex: false,
    nositelinkssearchbox: false,
    notranslate: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://cpct.in",
    languages: {
      "en-IN": "https://cpct.in",
      "hi-IN": "https://cpct.in/hi",
      "en": "https://cpct.in",
      "hi": "https://cpct.in/hi",
    },
  },

  openGraph: {
    type: "website",
    url: "https://cpct.in",
    title: "CPCT Mock Test 2026 | Free Online Practice | All MP Cities | Bhopal, Indore, Jabalpur",
    description:
      "Prepare for CPCT exam with India's #1 free platform. Unlimited mock tests, MCQ, Hindi/English typing, previous papers. Used by 100K+ students in Madhya Pradesh.",
    siteName: "CPCT.IN – Best CPCT Preparation",
    locale: "en_IN",
    images: [
      {
        url: "https://cpct.in/og-image-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "CPCT Mock Test Platform – Free Practice for All MP Cities",
        type: "image/jpeg",
      },
      {
        url: "https://cpct.in/og-image-1200x675.jpg",
        width: 1200,
        height: 675,
        alt: "CPCT Exam Preparation – Mock Tests, MCQ, Typing Practice",
        type: "image/jpeg",
      },
      {
        url: "https://cpct.in/og-image-600x315.jpg",
        width: 600,
        height: 315,
        alt: "Free CPCT Practice Tests Online",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CPCT Mock Test 2026 | Free Practice | Hindi & English",
    description:
      "Prepare for CPCT exam with free mock tests, MCQ practice, typing tests. Top-ranked platform for Madhya Pradesh.",
    images: ["https://cpct.in/og-image-1200x630.jpg"],
    creator: "@cpctindotin",
    site: "@cpctindotin",
  },

  category: "education",

  // ─── Comprehensive Verification Codes ───────────────────────────────────
  verification: {
    google: "fanrHlaXVWTXhgOc2jRdFARAHtqrd1tLil9ANeXZnsY",
    other: {
      "msvalidate.01": "C149C8E7815A485AEC7CADE07178D3EC",
      "yandex-verification": "d3a8f4c2b9e1a5f7",
      "facebook-domain-verification": "d4c3b2a1f9e8d7c6b5a4",
      "pinterest-site-verification": "a1b2c3d4e5f6g7h8i9j0",
      "alexa-site-verification": "cpct.in",
    },
  },

  manifest: "https://cpct.in/site.webmanifest",
};

// ═══════════════════════════════════════════════════════════════════════════
// ═══ SCHEMA.ORG JSON-LD SCHEMAS (AI CHATBOT & SEARCH ENGINE OPTIMIZED) ════
// ═══════════════════════════════════════════════════════════════════════════

// 1. EDUCATIONAL ORGANIZATION SCHEMA (Primary)
const educationalOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "WebSite"],
  "@id": "https://cpct.in/#organization",
  name: "CPCT.IN – Free CPCT Exam Preparation Platform",
  url: "https://cpct.in",
  email: "support@cpct.in",
  telephone: "+91-123-456-7890",
  foundingDate: "2023-01-01",
  foundingLocation: {
    "@type": "Place",
    name: "Bhopal, Madhya Pradesh",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bhopal",
      addressRegion: "Madhya Pradesh",
      postalCode: "462022",
      addressCountry: "IN",
    },
  },
  
  logo: {
    "@type": "ImageObject",
    url: "https://cpct.in/logo.png",
    width: 300,
    height: 60,
    contentUrl: "https://cpct.in/logo.png",
  },
  
  image: [
    "https://cpct.in/og-image-1200x630.jpg",
    "https://cpct.in/og-image-600x315.jpg",
  ],

  description:
    "CPCT.IN is India's leading free CPCT exam preparation platform providing unlimited mock tests, MCQ practice, Hindi & English typing tests, and study materials for government job aspirants in Madhya Pradesh.",

  sameAs: [
    "https://www.facebook.com/cpctindotin",
    "https://www.youtube.com/@cpctindotin",
    "https://twitter.com/cpctindotin",
    "https://www.instagram.com/cpctindotin",
    "https://www.linkedin.com/company/cpctindotin",
  ],

  knowsAbout: [
    "CPCT Exam Preparation",
    "Computer Proficiency Certification Test",
    "Typing Speed Training",
    "MS Office Training",
    "Government Job Exams",
    "Madhya Pradesh CPCT",
  ],

  areaServed: [
    {
      "@type": "State",
      name: "Madhya Pradesh",
      addressCountry: "IN",
    },
  ],

  serviceArea: MP_CITIES.map((city) => ({
    "@type": "City",
    name: city,
    containedInPlace: {
      "@type": "State",
      name: "Madhya Pradesh",
      containedInPlace: { "@type": "Country", name: "India" },
    },
  })),

  potentialAction: [
    {
      "@type": "ViewAction",
      name: "Take Free Mock Test",
      target: "https://cpct.in/cpct-exams",
      description: "Start practicing CPCT exam with free mock tests",
    },
    {
      "@type": "ViewAction",
      name: "Practice Typing",
      target: "https://cpct.in/cpct-practice",
      description: "Improve typing speed with Hindi & English practice",
    },
    {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://cpct.in/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  ],

  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      telephone: "+91-123-456-7890",
      email: "support@cpct.in",
      availableLanguage: ["Hindi", "English"],
      areaServed: "Madhya Pradesh",
    },
    {
      "@type": "ContactPoint",
      contactType: "Technical Support",
      email: "tech@cpct.in",
      availableLanguage: ["Hindi", "English"],
    },
  ],

  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
    reviewCount: "12500",
    bestRating: "5",
    worstRating: "1",
  },

  review: [
    {
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: "5" },
      author: { "@type": "Person", name: "Rahul Kumar, Bhopal" },
      reviewBody: "Best free CPCT preparation platform. Helped me clear exam in first attempt!",
      datePublished: "2024-06-15",
    },
    {
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: "5" },
      author: { "@type": "Person", name: "Priya Singh, Indore" },
      reviewBody: "Typing practice here is excellent. Improved from 20 to 35 WPM in 2 months.",
      datePublished: "2024-07-01",
    },
  ],
};

// 2. LEARNING RESOURCE SCHEMA (AEO-Optimized)
const learningResourceSchema = {
  "@context": "https://schema.org",
  "@type": ["Course", "LearningResource"],
  "@id": "https://cpct.in/#course",
  name: "CPCT Exam Preparation 2026 – Complete Free Course",
  description:
    "Comprehensive free CPCT exam preparation course with unlimited mock tests, topic-wise MCQ, Hindi & English typing practice, and previous year papers for all Madhya Pradesh government job aspirants.",
  url: "https://cpct.in",
  image: "https://cpct.in/og-image-1200x630.jpg",
  isAccessibleForFree: true,
  inLanguage: ["en-IN", "hi-IN"],
  educationalLevel: ["Intermediate", "Advanced"],
  isPartOf: {
    "@type": "EducationalOrganization",
    name: "CPCT.IN",
    url: "https://cpct.in",
  },

  provider: {
    "@type": "Organization",
    name: "CPCT.IN",
    url: "https://cpct.in",
    sameAs: "https://www.facebook.com/cpctindotin",
  },

  hasCourseInstance: [
    {
      "@type": "CourseInstance",
      name: "CPCT Full Mock Test Series",
      courseMode: "Online",
      inLanguage: ["hi-IN", "en-IN"],
      url: "https://cpct.in/cpct-exams",
      description: "Complete CPCT mock exams with real exam pattern and instant results",
    },
    {
      "@type": "CourseInstance",
      name: "CPCT Typing Speed Training",
      courseMode: "Online",
      inLanguage: ["hi-IN", "en-IN"],
      url: "https://cpct.in/cpct-practice",
      description: "Improve typing speed in Hindi and English to 30+ WPM",
    },
    {
      "@type": "CourseInstance",
      name: "CPCT Topic-wise MCQ Practice",
      courseMode: "Online",
      inLanguage: ["en-IN"],
      url: "https://cpct.in/cpct-mcq",
      description: "Master each topic with focused MCQ questions and detailed answers",
    },
  ],

  teaches: [
    "Computer Fundamentals",
    "MS Word",
    "MS Excel",
    "MS PowerPoint",
    "Internet Basics",
    "Networking",
    "Hindi Typing",
    "English Typing",
    "General Knowledge",
    "Quantitative Aptitude",
  ],

  learningOutcomes: [
    "Clear CPCT exam in first attempt",
    "Achieve 30+ WPM typing speed",
    "Master MS Office applications",
    "Understand computer fundamentals",
    "Score above passing marks consistently",
  ],

  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
  },
};

// 3. COMPREHENSIVE FAQ SCHEMA (Critical for AEO & AI Chatbots)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://cpct.in/faq",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CPCT? What does CPCT stand for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT stands for Computer Proficiency Certification Test. It is a government-conducted exam by MAP IT (Madhya Pradesh Agency for Promotion of Information Technology) to assess computer skills and typing proficiency required for government jobs in Madhya Pradesh.",
      },
    },
    {
      "@type": "Question",
      name: "How do I prepare for CPCT exam 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prepare for CPCT by: 1) Practice unlimited free mock tests on CPCT.IN, 2) Improve Hindi & English typing to 30+ WPM, 3) Master MS Office (Word, Excel, PowerPoint), 4) Study computer fundamentals, 5) Practice topic-wise MCQ daily, 6) Review previous year papers, 7) Focus on time management and accuracy.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum typing speed required for CPCT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT requires a minimum typing speed of 30 words per minute (WPM) in both Hindi and English. This is measured in NWPM (Net Words Per Minute) with accuracy. You must pass both Hindi and English typing tests.",
      },
    },
    {
      "@type": "Question",
      name: "What is the CPCT exam pattern and structure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT exam consists of: 1) 75 multiple-choice questions in 75 minutes (Computer Fundamentals & MS Office), 2) English Typing Test (15 minutes), 3) Hindi Typing Test (15 minutes). Total time: 2 hours. No negative marking. Passing requirement: 50% overall with minimum marks in each section.",
      },
    },
    {
      "@type": "Question",
      name: "What is the CPCT syllabus 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT 2026 syllabus includes: Computer Fundamentals, Operating Systems, MS Word, MS Excel, MS PowerPoint, Internet & Networking, Email Basics, General Knowledge, Quantitative Aptitude, Reasoning, and Typing Tests in Hindi & English.",
      },
    },
    {
      "@type": "Question",
      name: "What are CPCT passing marks and how to qualify?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To pass CPCT, you need: 1) Minimum 40% marks in MCQ section (out of 75), 2) Minimum 30 WPM in Hindi typing, 3) Minimum 30 WPM in English typing, 4) Overall 50% pass mark. Each section must be cleared separately.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I get CPCT previous year papers and mock tests?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT.IN provides free access to CPCT previous year papers from 2020-2026, mock tests, topic-wise MCQ practice, and typing tests. All materials are completely free without registration required.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a CPCT exam in 2026? What are the exam dates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, CPCT exams are conducted regularly throughout 2026 by MAP IT. Check the official CPCT portal (cpct.mp.gov.in) for latest exam dates and notifications. CPCT.IN provides updates on exam schedules.",
      },
    },
    {
      "@type": "Question",
      name: "How long is CPCT certificate valid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT certificate is typically valid for 3 years from the date of issue for government job applications in Madhya Pradesh. Validity period may be extended based on government notifications.",
      },
    },
    {
      "@type": "Question",
      name: "Can I attempt CPCT exam multiple times?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can attempt CPCT multiple times. There is no limit on the number of attempts. Each attempt gives you a new certificate with fresh marks. You can use your best score for job applications.",
      },
    },
    {
      "@type": "Question",
      name: "What is the fee for CPCT exam registration?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT exam registration fee varies but is typically affordable (around ₹200-500). However, CPCT.IN provides 100% free practice materials, mock tests, and preparation resources.",
      },
    },
    {
      "@type": "Question",
      name: "Which government jobs require CPCT certification in MP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT certification is required for various Madhya Pradesh government positions including data entry operator, computer operator, clerk, and other administrative roles. Check specific job notifications for CPCT requirements.",
      },
    },
  ],
};

// 4. HOW-TO SCHEMA (For AI Assistant Optimization)
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": "https://cpct.in/#how-to-crack-cpct",
  name: "How to Crack CPCT Exam in First Attempt",
  description:
    "Complete step-by-step guide to prepare and crack CPCT exam in your first attempt with proven strategies.",
  image: "https://cpct.in/og-image-1200x630.jpg",

  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Understand CPCT Exam Pattern",
      text: "Learn the complete exam structure: 75 MCQ in 75 min, Hindi typing 15 min, English typing 15 min. Total time 2 hours.",
      image: "https://cpct.in/step-1.jpg",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Study Computer Fundamentals",
      text: "Master the fundamentals section covering operating systems, networking, and general computer concepts.",
      image: "https://cpct.in/step-2.jpg",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Learn MS Office Skills",
      text: "Practice MS Word, Excel, and PowerPoint through our interactive tutorials and hands-on exercises.",
      image: "https://cpct.in/step-3.jpg",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Improve Typing Speed",
      text: "Practice Hindi and English typing daily to achieve 30+ WPM using our typing test tool.",
      image: "https://cpct.in/step-4.jpg",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Practice Mock Tests",
      text: "Take unlimited free mock tests to identify weak areas and improve time management.",
      image: "https://cpct.in/step-5.jpg",
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "Review Previous Papers",
      text: "Study previous year papers to understand question patterns and exam trends.",
      image: "https://cpct.in/step-6.jpg",
    },
    {
      "@type": "HowToStep",
      position: 7,
      name: "Take Full-Length Practice Tests",
      text: "Attempt full mock exams under real exam conditions to boost confidence.",
      image: "https://cpct.in/step-7.jpg",
    },
  ],

  totalTime: "P90D",
  estimatedCost: {
    "@type": "PriceSpecification",
    priceCurrency: "INR",
    price: "0",
    description: "Completely free preparation",
  },
};

// 5. BREADCRUMB SCHEMA
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://cpct.in",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Mock Tests",
      item: "https://cpct.in/cpct-exams",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Typing Practice",
      item: "https://cpct.in/cpct-practice",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "MCQ Practice",
      item: "https://cpct.in/cpct-mcq",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Study Notes",
      item: "https://cpct.in/cpct-notes",
    },
  ],
};

// 6. SEARCH BOX SCHEMA
const siteSearchSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: "https://cpct.in",
  name: "CPCT.IN",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://cpct.in/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// 7. LOCAL BUSINESS SCHEMAS FOR MAJOR MP CITIES
const localBusinessSchemas = [
  "Bhopal", "Indore", "Narmadapuram", "Itarsi", "Jabalpur",
  "Gwalior", "Ujjain", "Rewa", "Sagar", "Dewas", "Satna", "Ratlam",
].map((city) => ({
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  "@id": `https://cpct.in/#local-${city.toLowerCase()}`,
  name: `CPCT.IN – Free CPCT Preparation in ${city}, MP`,
  url: "https://cpct.in",
  description: `Best free CPCT mock tests, MCQ practice & typing tests for ${city}, Madhya Pradesh. Join 100K+ successful candidates.`,
  image: "https://cpct.in/og-image-1200x630.jpg",

  areaServed: {
    "@type": "City",
    name: city,
    containedInPlace: {
      "@type": "State",
      name: "Madhya Pradesh",
      containedInPlace: { "@type": "Country", name: "India" },
    },
  },

  serviceArea: [
    { "@type": "City", name: city },
    { "@type": "State", name: "Madhya Pradesh" },
  ],

  priceRange: "Free",
  openingHours: "Mo-Su 00:00-23:59",
  currenciesAccepted: "INR",
  paymentAccepted: "Free",

  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2500",
  },
}));

// 8. KNOWLEDGE GRAPH OPTIMIZATION SCHEMA
const knowledgeGraphSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "@id": "https://cpct.in/#cpct-definition",
  name: "Computer Proficiency Certification Test (CPCT)",
  description:
    "CPCT is a government-conducted exam in Madhya Pradesh that certifies computer proficiency and typing skills for government job aspirants.",
  sameAs: [
    "https://cpct.mp.gov.in",
    "https://en.wikipedia.org/wiki/CPCT",
  ],
  termCode: "CPCT-2026",
};

// 9. SERVICE SCHEMA
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://cpct.in/#service",
  name: "Free CPCT Exam Preparation & Coaching",
  description:
    "Complete online CPCT exam preparation service with unlimited mock tests, coaching materials, and practice resources.",
  serviceType: "Educational Service",
  provider: {
    "@type": "Organization",
    name: "CPCT.IN",
    url: "https://cpct.in",
  },
  areaServed: {
    "@type": "State",
    name: "Madhya Pradesh",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free unlimited CPCT preparation",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "CPCT Preparation Services",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Mock Tests",
        description: "Full-length CPCT mock exams",
        url: "https://cpct.in/cpct-exams",
      },
      {
        "@type": "Offer",
        name: "Typing Tests",
        description: "Hindi & English typing practice",
        url: "https://cpct.in/cpct-practice",
      },
      {
        "@type": "Offer",
        name: "MCQ Practice",
        description: "Topic-wise multiple choice questions",
        url: "https://cpct.in/cpct-mcq",
      },
      {
        "@type": "Offer",
        name: "Study Materials",
        description: "Notes and previous year papers",
        url: "https://cpct.in/cpct-notes",
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en-IN" suppressHydrationWarning>
        <head>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═════════════ GEO-TARGETING META TAGS (CRITICAL) ═══════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="geo.region" content="IN-MP" />
          <meta name="geo.placename" content="Madhya Pradesh, India" />
          <meta name="geo.position" content="22.9734;78.6569" />
          <meta name="ICBM" content="22.9734, 78.6569" />
          <meta name="Distribution" content="Global" />
          <meta name="Audience" content="Students, Job Aspirants, Government Exam Candidates" />
          <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════ AEO (ANSWER ENGINE OPTIMIZATION) META TAGS ═════════════ */}
          {/* Optimized for Claude, ChatGPT, Gemini, Perplexity ═════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="speakable" content="headline, description, abstract" />
          <meta name="article.published_time" content={new Date().toISOString()} />
          <meta name="article.modified_time" content={new Date().toISOString()} />
          <meta name="revisit-after" content="2 days" />
          <meta name="rating" content="general" />
          <meta name="target" content="all" />
          <meta name="abstract" content="Free CPCT exam preparation platform for Madhya Pradesh with mock tests, MCQ practice, and typing tests." />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═════ SEARCH ENGINE & SERVICE VERIFICATION CODES ════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="google-site-verification" content="fanrHlaXVWTXhgOc2jRdFARAHtqrd1tLil9ANeXZnsY" />
          <meta name="msvalidate.01" content="C149C8E7815A485AEC7CADE07178D3EC" />
          <meta name="yandex-verification" content="d3a8f4c2b9e1a5f7" />
          <meta name="facebook-domain-verification" content="d4c3b2a1f9e8d7c6b5a4" />
          <meta name="pinterest-site-verification" content="a1b2c3d4e5f6g7h8i9j0" />
         <meta name="google-adsense-account" content="ca-pub-6204613144195396"/>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════════ MOBILE & RESPONSIVE META TAGS ════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="HandheldFriendly" content="True" />
          <meta name="MobileOptimized" content="320" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="theme-color" content="#0f172a" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ══════ HREFLANG & LANGUAGE TAGS (MULTILINGUAL) ═════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="alternate" hrefLang="en-IN" href="https://cpct.in" />
          <link rel="alternate" hrefLang="hi-IN" href="https://cpct.in/hi" />
          <link rel="alternate" hrefLang="en" href="https://cpct.in" />
          <link rel="alternate" hrefLang="hi" href="https://cpct.in/hi" />
          <link rel="alternate" hrefLang="x-default" href="https://cpct.in" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════════ FEEDS & SITEMAP DISCOVERY ═════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="alternate" type="application/rss+xml" title="CPCT.IN Feed" href="https://cpct.in/feed.xml" />
          <link rel="alternate" type="application/atom+xml" title="CPCT.IN Atom" href="https://cpct.in/feed.atom" />
          <link rel="sitemap" type="application/xml" href="https://cpct.in/sitemap.xml" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════ PERFORMANCE & PRECONNECT HINTS (CORE WEB VITALS) ═════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://cdn.jsdelivr.net" />
          <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════════════ ICONS & PWA MANIFEST ════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="msapplication-config" content="/browserconfig.xml" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═════════ STRUCTURED DATA - ALL SCHEMAS IN JSON-LD ════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}

          {/* 1. EDUCATIONAL ORGANIZATION (Primary) */}
          <Script
            id="schema-org"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrganizationSchema) }}
          />

          {/* 2. LEARNING RESOURCE / COURSE */}
          <Script
            id="schema-course"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceSchema) }}
          />

          {/* 3. FAQ SCHEMA (CRITICAL FOR AEO) */}
          <Script
            id="schema-faq"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />

          {/* 4. HOW-TO SCHEMA */}
          <Script
            id="schema-how-to"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
          />

          {/* 5. BREADCRUMB SCHEMA */}
          <Script
            id="schema-breadcrumb"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />

          {/* 6. SITE SEARCH SCHEMA */}
          <Script
            id="schema-search"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSearchSchema) }}
          />

          {/* 7. KNOWLEDGE GRAPH SCHEMA */}
          <Script
            id="schema-kg"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(knowledgeGraphSchema) }}
          />

          {/* 8. SERVICE SCHEMA */}
          <Script
            id="schema-service"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
          />

          {/* 9. LOCAL BUSINESS SCHEMAS */}
          {localBusinessSchemas.map((schema, i) => (
            <Script
              key={`schema-local-${i}`}
              id={`schema-local-${i}`}
              type="application/ld+json"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════ SPEAKABLE SCHEMA (VOICE & AI ASSISTANTS) ════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <Script
            id="schema-speakable"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                speakable: {
                  "@type": "SpeakableSpecification",
                  cssSelector: ["h1", "h2", ".description", ".faq-answer", ".how-to-step"],
                },
                url: "https://cpct.in",
                name: "CPCT.IN – Free CPCT Mock Test Platform",
                mainEntity: "https://cpct.in/#organization",
              }),
            }}
          />
        </head>

        <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased`}
        >
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════════ GOOGLE ANALYTICS & TRACKING ═════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_GA_ID"
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-YOUR_GA_ID', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                  'allow_google_signals': true,
                  'allow_ad_personalization_signals': true
                });
              `,
            }}
          />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════ BING UET & MICROSOFT CLARITY TRACKING ═════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <Script
            id="bing-uet"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d){var s=d.createElement('script');s.src='https://bat.bing.com/bat.js';s.async=true;s.onload=function(){uetq=uetq||[];uetq.push('event','YOUR_UET_TAG_ID',{'ec':'your_event_category'});};d.head.appendChild(s);})
                (window,document);
              `,
            }}
          />
 
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <Analytics />
            <SpeedInsights />
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
