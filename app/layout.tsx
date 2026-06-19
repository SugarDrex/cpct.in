
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

// ─── Enhanced City-wise keyword expansion with intent & semantic variation ────
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
];

// ─── AI Answer Engine Keywords (AEO) ─────────────────────────────────────────
const aeoKeywords = [
  "CPCT vs other typing certification exams",
  "how many attempts for CPCT exam",
  "CPCT syllabus breakdown 2026",
  "CPCT computer fundamentals guide",
  "CPCT MS Office typing test format",
  "how to improve CPCT typing speed",
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
];

export const metadata: Metadata = {
  metadataBase: new URL("https://cpct.in"),

  title: {
    default:
      "CPCT.IN – #1 Free CPCT Mock Test & MCQ Practice | Hindi & English Typing | All MP Cities | Bhopal, Indore, Jabalpur",
    template: "%s | CPCT.IN – Best CPCT Preparation Platform Madhya Pradesh",
  },

  description:
    "CPCT.IN – Madhya Pradesh's #1 Free CPCT Preparation Platform. Free CPCT mock tests, topic-wise MCQ exams, Hindi & English typing practice, previous year papers for Bhopal, Indore, Jabalpur, Narmadapuram, Itarsi and ALL MP cities. Practice CPCT online now – No registration needed. Updated 2026.",

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
    "CPCT online test free",
    
    // ═══ INTENT-DRIVEN KEYWORDS ═══
    "how to prepare for CPCT exam",
    "CPCT exam syllabus 2026",
    "CPCT exam date 2026 Madhya Pradesh",
    "what is CPCT exam",
    "CPCT passing marks MP",
    "CPCT typing speed requirement",
    "CPCT general knowledge questions",
    "CPCT computer questions with answers",
    "CPCT exam guide MP government job",
    "best CPCT preparation website India",
    "CPCT mock test free no registration",
    
    // ═══ LONG-TAIL & SEMANTIC VARIATIONS ═══
    "CPCT full form computer proficiency certification test",
    "CPCT typing test 30 WPM Madhya Pradesh",
    "CPCT MCQ hindi english bilingual",
    "CPCT exam pattern 2026 MP",
    "CPCT computer fundamentals basics",
    "CPCT MS Office Word Excel PowerPoint",
    "CPCT internet networking basics",
    "CPCT general awareness current affairs",
    "CPCT quantitative aptitude reasoning",
    
    // ═══ CITY-SPECIFIC KEYWORDS (GEO) ═══
    ...cityKeywords,
    
    // ═══ VOICE SEARCH KEYWORDS ═══
    ...voiceSearchKeywords,
    
    // ═══ AEO (ANSWER ENGINE OPTIMIZATION) ═══
    ...aeoKeywords,
    
    // ═══ BOT-OPTIMIZED KEYWORDS ═══
    ...botOptimizedKeywords,
  ],

  authors: [{ name: "CPCT.IN Team", url: "https://cpct.in" }],
  creator: "CPCT.IN – Free CPCT Preparation Platform",
  publisher: "CPCT.IN",
  
  // ─── Enhanced robots metadata for better crawler indexing ─────────────────
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

  // ─── OpenGraph for Social Sharing & LLM Training ─────────────────────────
  openGraph: {
    type: "website",
    url: "https://cpct.in",
    title: "CPCT.IN – #1 Free CPCT Mock Test, MCQ & Typing Practice | All MP Cities",
    description:
      "MP's best free CPCT preparation: unlimited mock tests, topic-wise MCQ, Hindi/English typing. Trusted by 100K+ students in Bhopal, Indore, Narmadapuram, Itarsi & all Madhya Pradesh cities. Start free CPCT practice now.",
    siteName: "CPCT.IN – Best CPCT Preparation Platform",
    locale: "en_IN",
  
    images: [
      {
        url: "https://cpct.in/og-image-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "CPCT.IN – #1 Free CPCT Mock Test Platform Madhya Pradesh",
        type: "image/jpeg",
      },
      {
        url: "https://cpct.in/og-image-1200x675.jpg",
        width: 1200,
        height: 675,
        alt: "CPCT Mock Test Free | MCQ Practice | Typing Test | CPCT.IN",
        type: "image/jpeg",
      },
    ],
  },

  // ─── Twitter Card for Social Discoverability ────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "CPCT Mock Test 2026 | Free MCQ & Typing Practice | CPCT.IN",
    description:
      "Prepare for CPCT exam with free mock tests, topic-wise MCQ, Hindi & English typing practice. Trusted platform for all MP cities. 100% free, no registration required.",
    images: ["https://cpct.in/og-image-1200x630.jpg"],
    creator: "@cpctindotin",
    site: "@cpctindotin",
  },

  category: "education",

  // ─── Verification Codes for Search Console, Bing, Yandex ────────────────
  verification: {
    google: "fanrHlaXVWTXhgOc2jRdFARAHtqrd1tLil9ANeXZnsY",
    other: {
      "msvalidate.01": "C149C8E7815A485AEC7CADE07178D3EC",
      "yandex-verification": "YOUR_YANDEX_CODE",
      "facebook-domain-verification": "YOUR_FACEBOOK_CODE",
      "pinterest-site-verification": "YOUR_PINTEREST_CODE",
    },
  },

  // ─── AppLinks for Mobile App Discoverability (AEO) ──────────────────────
  appLinks: {
    web: { url: "https://cpct.in", should_fallback: true },
    ios: { url: "YOUR_IOS_APP_URL", app_store_id: "YOUR_APP_ID" },
    android: { url: "YOUR_ANDROID_APP_URL", package: "YOUR_PACKAGE_NAME" },
  },
  
  // ─── Manifest for PWA Support ──────────────────────────────────────────
  manifest: "https://cpct.in/site.webmanifest",
};

// ═══════════════════════════════════════════════════════════════════════════
// ═══ STRUCTURED DATA SCHEMAS (SCHEMA.ORG JSON-LD) ═══════════════════════════
// ═══════════════════════════════════════════════════════════════════════════

// 1. COMPREHENSIVE WEBSITE SCHEMA
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalWebSite",
  "@id": "https://cpct.in/#website",
  name: "CPCT.IN – Free CPCT Preparation Platform",
  alternateName: [
    "CPCT Mock Test",
    "CPCT Preparation MP",
    "CPCT Online Test",
    "CPCT Exam Preparation",
    "Free CPCT Practice",
  ],
  url: "https://cpct.in",
  description:
    "CPCT.IN is Madhya Pradesh's #1 free CPCT exam preparation platform offering unlimited mock tests, topic-wise MCQ, Hindi and English typing practice, and complete study materials for all MP cities.",
  inLanguage: ["en-IN", "hi-IN"],
  primaryLanguage: "en-IN",
  keywords:
    "CPCT mock test, CPCT MCQ, CPCT typing practice, CPCT preparation MP, CPCT coaching Bhopal Indore",
  datePublished: "2023-01-01T00:00:00Z",
  dateModified: new Date().toISOString(),
  isAccessibleForFree: true,
  publisher: {
    "@type": "Organization",
    "@id": "https://cpct.in/#organization",
    name: "CPCT.IN",
    url: "https://cpct.in",
    logo: {
      "@type": "ImageObject",
      url: "https://cpct.in/logo.png",
      width: 300,
      height: 60,
    },
    image: "https://cpct.in/og-image-1200x630.jpg",
    sameAs: [
      "https://www.facebook.com/cpctindotin",
      "https://www.youtube.com/@cpctindotin",
      "https://twitter.com/cpctindotin",
      "https://www.instagram.com/cpctindotin",
      "https://www.linkedin.com/company/cpctindotin",
    ],
    areaServed: {
      "@type": "State",
      name: "Madhya Pradesh",
      addressCountry: "IN",
      containsPlace: MP_CITIES.map((city) => ({
        "@type": "City",
        name: city,
        containedInPlace: { "@type": "State", name: "Madhya Pradesh" },
      })),
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["Hindi", "English"],
        email: "support@cpct.in",
        url: "https://cpct.in/contact",
      },
      {
        "@type": "ContactPoint",
        contactType: "technical support",
        availableLanguage: ["Hindi", "English"],
        email: "tech@cpct.in",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bhopal",
      addressRegion: "Madhya Pradesh",
      postalCode: "462022",
      addressCountry: "IN",
    },
  },
  potentialAction: [
    {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://cpct.in/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    {
      "@type": "ViewAction",
      name: "Start CPCT Mock Test",
      target: "https://cpct.in/mock-test",
    },
    {
      "@type": "ViewAction",
      name: "CPCT Typing Practice",
      target: "https://cpct.in/typing-test",
    },
    {
      "@type": "ViewAction",
      name: "CPCT MCQ Practice",
      target: "https://cpct.in/mcq",
    },
  ],
};

// 2. ORGANIZATION SCHEMA WITH GEO PRESENCE
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://cpct.in/#organization",
  name: "CPCT.IN",
  url: "https://cpct.in",
  logo: "https://cpct.in/logo.png",
  image: "https://cpct.in/og-image-1200x630.jpg",
  description:
    "Leading CPCT exam preparation platform in Madhya Pradesh with free unlimited mock tests, MCQ practice, and typing tests.",
  foundingDate: "2023-01-01",
  foundingLocation: {
    "@type": "City",
    name: "Bhopal",
    addressRegion: "Madhya Pradesh",
    addressCountry: "IN",
  },
  knowsAbout: [
    "CPCT Exam Preparation",
    "Computer Proficiency Certification Test",
    "Hindi Typing Practice",
    "English Typing Practice",
    "CPCT Mock Test",
    "Government Job Exam MP",
    "Computer Fundamentals",
    "MS Office Typing",
  ],
  areaServed: MP_CITIES.map((city) => ({
    "@type": "City",
    name: city,
    addressRegion: "Madhya Pradesh",
    addressCountry: "IN",
  })),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["Hindi", "English"],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
    bestRating: "5",
    worstRating: "1",
  },
};

// 3. COURSE SCHEMA (EDUCATIONAL PRODUCT)
const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": "https://cpct.in/#course",
  name: "CPCT Exam Preparation 2026 – Complete Guide",
  description:
    "Complete free CPCT preparation course with unlimited mock tests, topic-wise MCQ, Hindi and English typing practice, and previous year papers. Perfect for all students in Madhya Pradesh.",
  url: "https://cpct.in",
  image: "https://cpct.in/og-image-1200x630.jpg",
  provider: {
    "@type": "Organization",
    name: "CPCT.IN",
    url: "https://cpct.in",
    logo: "https://cpct.in/logo.png",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    category: "Free",
    url: "https://cpct.in/mock-test",
  },
  hasCourseInstance: [
    {
      "@type": "CourseInstance",
      name: "CPCT Mock Test Series",
      courseMode: "Online",
      inLanguage: ["hi-IN", "en-IN"],
      startDate: "2023-01-01",
      endDate: "2027-12-31",
      url: "https://cpct.in/mock-test",
    },
    {
      "@type": "CourseInstance",
      name: "CPCT Typing Practice",
      courseMode: "Online",
      inLanguage: ["hi-IN", "en-IN"],
      url: "https://cpct.in/typing-test",
    },
    {
      "@type": "CourseInstance",
      name: "CPCT Topic-wise MCQ Practice",
      courseMode: "Online",
      inLanguage: ["en-IN"],
      url: "https://cpct.in/mcq",
    },
  ],
  educationalLevel: "Intermediate",
  teaches: [
    "Computer Fundamentals",
    "MS Office (Word, Excel, PowerPoint)",
    "Hindi Typing",
    "English Typing",
    "General Knowledge",
    "Quantitative Aptitude",
    "Internet & Networking Basics",
  ],
  learningOutcomes: [
    "Improve typing speed to 30+ WPM",
    "Master computer fundamentals",
    "Practice with real CPCT exam patterns",
    "Understand CPCT syllabus completely",
    "Get certified through CPCT exam",
  ],
  audience: {
    "@type": "Audience",
    audienceType: "CPCT Aspirants in Madhya Pradesh",
  },
  locationCreated: {
    "@type": "State",
    name: "Madhya Pradesh",
    addressCountry: "IN",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
  },
};

// 4. COMPREHENSIVE FAQ SCHEMA (FOR AEO – AI ANSWER ENGINES)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CPCT exam? Full form and meaning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT stands for Computer Proficiency Certification Test. It's a government certification exam conducted by MAP IT (Madhya Pradesh Information Technology) to test computer and typing skills required for Madhya Pradesh government jobs.",
      },
    },
    {
      "@type": "Question",
      name: "How to prepare for CPCT exam 2026 in Madhya Pradesh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prepare for CPCT by: 1) Practice free CPCT mock tests on CPCT.IN, 2) Improve Hindi & English typing to 30+ WPM, 3) Master computer fundamentals & MS Office, 4) Solve topic-wise MCQ daily, 5) Study previous year papers, 6) Focus on general knowledge and quantitative aptitude. CPCT.IN provides all free materials.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum typing speed required for CPCT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT requires a minimum typing speed of 30 words per minute (WPM) in Hindi and 30 WPM in English. You must clear both language typing tests. Practice free typing tests on CPCT.IN to improve speed and accuracy.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I find free CPCT mock test online in Madhya Pradesh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT.IN is the best and most trusted free CPCT mock test platform for MP. Students from Bhopal, Indore, Jabalpur, Narmadapuram, Itarsi, Gwalior, Ujjain and all MP cities use CPCT.IN for unlimited free CPCT practice without registration.",
      },
    },
    {
      "@type": "Question",
      name: "Is CPCT.IN completely free for CPCT preparation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, CPCT.IN is 100% free and no-cost. It offers unlimited free CPCT mock tests, topic-wise MCQ, Hindi typing practice, English typing practice, study materials, and previous year papers with zero subscription charges.",
      },
    },
    {
      "@type": "Question",
      name: "What is the complete CPCT exam syllabus for 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT 2026 syllabus includes: 1) Computer Fundamentals, 2) MS Office (Word, Excel, PowerPoint), 3) Internet & Networking Basics, 4) General Awareness, 5) Quantitative Aptitude, 6) Hindi Typing (Mangal/Kruti font), 7) English Typing. Practice all topics on CPCT.IN.",
      },
    },
    {
      "@type": "Question",
      name: "What is the CPCT exam date and notification 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT exam 2026 dates and notifications are released by MAP IT (Madhya Pradesh IT). Check the official CPCT portal (cpct.mp.gov.in) for latest exam dates. CPCT.IN also provides updates on exam schedules, notifications, and previous year papers.",
      },
    },
    {
      "@type": "Question",
      name: "What are the CPCT passing marks and qualifying criteria?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT passing marks vary by category. Generally, you need to: 1) Score minimum 40% in Computer Fundamentals & MS Office section, 2) Achieve 30 WPM in Hindi typing, 3) Achieve 30 WPM in English typing. Check official CPCT guidelines for exact passing criteria.",
      },
    },
    {
      "@type": "Question",
      name: "Best CPCT coaching and preparation centers in Bhopal, Indore, Narmadapuram, Jabalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT.IN is the top-rated online CPCT preparation platform serving students in Bhopal, Indore, Narmadapuram, Itarsi, Jabalpur, Gwalior, Ujjain and all Madhya Pradesh cities. It's completely free with 100% comprehensive preparation materials, mock tests, and typing practice.",
      },
    },
    {
      "@type": "Question",
      name: "How many questions are in CPCT mock test? What is the exam pattern?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT exam typically has 75 multiple choice questions (MCQ) to be solved in 60-90 minutes. The exam includes sections on Computer Fundamentals, MS Office, and Typing Tests in Hindi & English. Practice the exact pattern on CPCT.IN mock tests.",
      },
    },
  ],
};

// 5. BREADCRUMB SCHEMA FOR NAVIGATION
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
      name: "CPCT Mock Test",
      item: "https://cpct.in/mock-test",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "CPCT Typing Practice",
      item: "https://cpct.in/typing-test",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "CPCT MCQ Practice",
      item: "https://cpct.in/mcq",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Study Material",
      item: "https://cpct.in/study-material",
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Previous Year Papers",
      item: "https://cpct.in/previous-papers",
    },
  ],
};

// 6. SITELINKS SEARCH BOX (FOR GOOGLE SERP)
const sitelinksSchema = {
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

// 7. LOCAL BUSINESS SCHEMAS FOR TOP MP CITIES (GEO-TARGETING)
const localBusinessSchemas = [
  "Bhopal",
  "Indore",
  "Narmadapuram",
  "Itarsi",
  "Jabalpur",
  "Gwalior",
  "Ujjain",
  "Rewa",
  "Sagar",
  "Dewas",
  "Satna",
].map((city) => ({
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  "@id": `https://cpct.in/#local-${city.toLowerCase()}`,
  name: `CPCT.IN – Best CPCT Preparation & Mock Test in ${city}`,
  url: "https://cpct.in",
  description: `Best free CPCT mock test, MCQ practice & typing tests for students in ${city}, Madhya Pradesh. Prepare for CPCT exam with unlimited free practice. Join 100K+ students from ${city}.`,
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
  priceRange: "Free",
  openingHours: "Mo-Su 00:00-23:59",
  currenciesAccepted: "INR",
  paymentAccepted: "Free",
  serviceArea: [
    { "@type": "City", name: city },
    { "@type": "State", name: "Madhya Pradesh" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2500",
  },
  reviews: [
    {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
      },
      reviewBody: `CPCT.IN is the best free CPCT mock test platform in ${city}. Very helpful!`,
    },
  ],
}));

// 8. ARTICLE SCHEMA (FOR NEWS/BLOG CONTENT)
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "@id": "https://cpct.in/#article",
  headline: "CPCT Exam Preparation Guide 2026 – Complete Syllabus & Tips",
  description: "Complete guide to CPCT exam 2026 with syllabus, exam pattern, preparation tips, and free mock tests.",
  image: "https://cpct.in/og-image-1200x630.jpg",
  datePublished: "2023-01-01T00:00:00Z",
  dateModified: new Date().toISOString(),
  author: {
    "@type": "Organization",
    name: "CPCT.IN",
    url: "https://cpct.in",
  },
  publisher: {
    "@type": "Organization",
    name: "CPCT.IN",
    logo: {
      "@type": "ImageObject",
      url: "https://cpct.in/logo.png",
      width: 300,
      height: 60,
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://cpct.in",
  },
};

// 9. AGGREGATE OFFER SCHEMA
const aggregateOfferSchema = {
  "@context": "https://schema.org",
  "@type": "AggregateOffer",
  name: "CPCT Exam Preparation Courses",
  description: "Free unlimited CPCT mock tests, MCQ practice, and typing tests",
  offers: [
    {
      "@type": "Offer",
      name: "CPCT Mock Tests",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: "https://cpct.in/mock-test",
    },
    {
      "@type": "Offer",
      name: "CPCT Typing Practice",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: "https://cpct.in/typing-test",
    },
    {
      "@type": "Offer",
      name: "CPCT MCQ Practice",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: "https://cpct.in/mcq",
    },
  ],
  priceCurrency: "INR",
  lowPrice: "0",
  highPrice: "0",
  offerCount: "3",
};

// 10. PRODUCT SCHEMA (ALTERNATIVE TO COURSE)
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://cpct.in/#product",
  name: "CPCT.IN – Free CPCT Mock Test Platform",
  description: "Complete free CPCT preparation platform with unlimited mock tests, MCQ, and typing practice.",
  image: "https://cpct.in/og-image-1200x630.jpg",
  brand: {
    "@type": "Brand",
    name: "CPCT.IN",
  },
  offers: {
    "@type": "Offer",
    url: "https://cpct.in",
    priceCurrency: "INR",
    price: "0",
   
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: "CPCT.IN",
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
  },
  review: [
    {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
      },
      reviewBody: "Best free CPCT mock test platform in Madhya Pradesh!",
      author: {
        "@type": "Person",
        name: "Student from Bhopal",
      },
    },
  ],
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
          {/* ══════════ GEO-TARGETING META TAGS (CRITICAL FOR MP) ═══════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="geo.region" content="IN-MP" />
          <meta name="geo.placename" content="Madhya Pradesh, India" />
          <meta name="geo.position" content="22.9734;78.6569" />
          <meta name="ICBM" content="22.9734, 78.6569" />
          <meta name="Distribution" content="Global" />
          <meta name="Audience" content="All" />
          <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═════════ AEO (ANSWER ENGINE OPTIMIZATION) META TAGS ═════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="speakable" content="headline, description, abstract" />
          <meta name="google-site-verification" content="fanrHlaXVWTXhgOc2jRdFARAHtqrd1tLil9ANeXZnsY" />
          <meta name="revisit-after" content="2 days" />
          <meta name="rating" content="general" />
          <meta name="target" content="all" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══ SEARCH ENGINE VERIFICATION (GOOGLE, BING, YANDEX) ══════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="msvalidate.01" content="C149C8E7815A485AEC7CADE07178D3EC" />
          <meta name="yandex-verification" content="YOUR_YANDEX_CODE" />
           <meta name="google-site-verification" content="oU7imMI0GOYKmP0J-lGRtxKKHkiv72xvEF8B2aEeXgY" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════ MOBILE & RESPONSIVE META TAGS ════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <meta name="HandheldFriendly" content="True" />
          <meta name="MobileOptimized" content="320" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
          <meta name="format-detection" content="telephone=no" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════ LANGUAGE & REGION HREFLANG TAGS (MULTIREGION) ═════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="alternate" hrefLang="en-IN" href="https://cpct.in" />
          <link rel="alternate" hrefLang="hi-IN" href="https://cpct.in/hi" />
          <link rel="alternate" hrefLang="en" href="https://cpct.in" />
          <link rel="alternate" hrefLang="hi" href="https://cpct.in/hi" />
          <link rel="alternate" hrefLang="x-default" href="https://cpct.in" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════════ FEED & SITEMAP DISCOVERY ══════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="alternate" type="application/rss+xml" title="CPCT.IN Feed" href="https://cpct.in/feed.xml" />
          <link rel="alternate" type="application/atom+xml" title="CPCT.IN Atom" href="https://cpct.in/feed.atom" />
          <link rel="sitemap" type="application/xml" href="https://cpct.in/sitemap.xml" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═════════ PERFORMANCE & PRECONNECT HINTS (CORE WEB VITALS) ════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://cdn.jsdelivr.net" />
          <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════════════ ICONS & PWA MANIFEST ══════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0f172a" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="msapplication-config" content="/browserconfig.xml" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════════════ SPEAKABLE SCHEMA (VOICE/AI) ═══════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                speakable: {
                  "@type": "SpeakableSpecification",
                  cssSelector: ["h1", "h2", ".speakable", ".description"],
                },
                url: "https://cpct.in",
                name: "CPCT.IN – #1 Free CPCT Mock Test Platform",
              }),
            }}
          />
        </head>

        <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased`}
        >
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ══════════════════ GOOGLE ANALYTICS & ADS ═════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}

          {/* Google Analytics 4 */}
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
                });
              `,
            }}
          />

          {/* Google AdSense */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7991231452123187"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ════════════════ ALL STRUCTURED DATA SCHEMAS ═══════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}

          {/* 1. WEBSITE SCHEMA */}
          <Script
            id="schema-website"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />

          {/* 2. ORGANIZATION SCHEMA */}
          <Script
            id="schema-organization"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />

          {/* 3. COURSE SCHEMA */}
          <Script
            id="schema-course"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
          />

          {/* 4. FAQ SCHEMA (AEO CRITICAL) */}
          <Script
            id="schema-faq"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />

          {/* 5. BREADCRUMB SCHEMA */}
          <Script
            id="schema-breadcrumb"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />

          {/* 6. SITELINKS SEARCH BOX */}
          <Script
            id="schema-sitelinks"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(sitelinksSchema) }}
          />

          {/* 7. ARTICLE SCHEMA */}
          <Script
            id="schema-article"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
          />

          {/* 8. PRODUCT SCHEMA */}
          <Script
            id="schema-product"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />

          {/* 9. AGGREGATE OFFER SCHEMA */}
          <Script
            id="schema-aggregate-offer"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateOfferSchema) }}
          />

          {/* 10. LOCAL BUSINESS SCHEMAS FOR ALL TOP MP CITIES */}
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
          {/* ═════════════════ APP & THEME PROVIDER ════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════ */}

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
