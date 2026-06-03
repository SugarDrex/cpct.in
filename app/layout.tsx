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
  subsets: ["latin"],
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

// ─── City-wise keyword expansion ─────────────────────────────────────────────
const cityKeywords = MP_CITIES.flatMap((city) => [
  `CPCT mock test ${city}`,
  `CPCT typing practice ${city}`,
  `CPCT coaching ${city}`,
  `CPCT exam preparation ${city}`,
  `CPCT MCQ test ${city}`,
  `CPCT topic wise test ${city} MP`,
]);

export const metadata: Metadata = {
  metadataBase: new URL("https://cpct.in"),

  title: {
    default:
      "CPCT.IN – #1 CPCT Exam Preparation | Free Mock Test, MCQ, Typing Practice | Bhopal, Indore, Narmadapuram, All MP Cities",
    template: "%s | CPCT.IN – Best CPCT Platform MP",
  },

  description:
    "CPCT.IN is Madhya Pradesh's #1 CPCT preparation platform. Free CPCT mock tests, topic-wise MCQ exams, Hindi & English typing practice, previous year papers for Bhopal, Indore, Jabalpur, Narmadapuram, Itarsi and all MP cities. Start free CPCT practice now.",

  keywords: [
    // Core national keywords
    "CPCT mock test 2025 2026",
    "CPCT exam preparation MP",
    "Free CPCT mock test online",
    "CPCT typing test Hindi English",
    "CPCT MCQ practice test",
    "CPCT topic wise exam",
    "CPCT previous year papers",
    "CPCT study material PDF",
    "CPCT online coaching Madhya Pradesh",
    "CPCT computer proficiency certification",
    "CPCT exam guide MP government job",
    "best CPCT preparation website India",
    // AEO / AI answer keywords
    "how to prepare for CPCT exam",
    "CPCT exam syllabus 2026",
    "CPCT exam date 2026 Madhya Pradesh",
    "what is CPCT exam",
    "CPCT passing marks MP",
    "CPCT typing speed requirement",
    "CPCT general knowledge questions",
    "CPCT computer questions with answers",
    // City-wise dynamic keywords
    ...cityKeywords,
  ],

  authors: [{ name: "CPCT.IN Team" }],
  creator: "CPCT.IN",
  publisher: "CPCT.IN",

  robots: {
    index: true,
    follow: true,
    nocache: false,
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
    },
  },

  openGraph: {
    type: "website",
    url: "https://cpct.in",
    title: "CPCT.IN – #1 Free CPCT Mock Test | MCQ | Typing Practice | All MP Cities",
    description:
      "MP's best CPCT preparation: free mock tests, topic-wise MCQ, Hindi/English typing. Trusted by students in Bhopal, Indore, Narmadapuram, Itarsi & all Madhya Pradesh cities.",
    siteName: "CPCT.IN",
    locale: "en_IN",
    images: [
      {
        url: "https://cpct.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CPCT Mock Test Platform – Best CPCT Preparation Madhya Pradesh",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CPCT Mock Test 2026 | Free MCQ & Typing Practice | CPCT.IN",
    description:
      "Prepare for CPCT exam with free mock tests, topic-wise MCQ, typing practice in Hindi & English. Trusted platform for all MP cities.",
    images: ["https://cpct.in/og-image.jpg"],
    creator: "@cpctindotinofficial",
    site: "@cpctindotinofficial",
  },

  category: "education",

  verification: {
    google: "fanrHlaXVWTXhgOc2jRdFARAHtqrd1tLil9ANeXZnsY",
    other: {
      "msvalidate.01": "C149C8E7815A485AEC7CADE07178D3EC",
      "yandex-verification": "YOUR_YANDEX_CODE",
    },
  },

  // AEO: App links for mobile discoverability
  appLinks: {
    web: { url: "https://cpct.in", should_fallback: true },
  },
};

// ─── Structured Data Schemas ─────────────────────────────────────────────────

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalWebSite",
  "@id": "https://cpct.in/#website",
  name: "CPCT.IN",
  alternateName: ["CPCT Mock Test", "CPCT Preparation MP", "CPCT Online Test"],
  url: "https://cpct.in",
  description:
    "CPCT.IN is Madhya Pradesh's #1 free CPCT exam preparation platform offering mock tests, topic-wise MCQ, Hindi and English typing practice, and study materials for all MP cities.",
  inLanguage: ["en-IN", "hi-IN"],
  keywords:
    "CPCT mock test, CPCT MCQ, CPCT typing practice, CPCT preparation MP, CPCT coaching Bhopal Indore",
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
    sameAs: [
      "https://www.facebook.com/cpctindotin",
      "https://www.youtube.com/@cpctindotin",
      "https://twitter.com/cpctindotin",
      "https://www.instagram.com/cpctindotin",
    ],
    areaServed: {
      "@type": "State",
      name: "Madhya Pradesh",
      containsPlace: MP_CITIES.map((city) => ({
        "@type": "City",
        name: city,
        containedInPlace: { "@type": "State", name: "Madhya Pradesh" },
      })),
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Hindi", "English"],
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
  ],
};

// Organization with full MP geo presence
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://cpct.in/#organization",
  name: "CPCT.IN",
  url: "https://cpct.in",
  logo: "https://cpct.in/logo.png",
  description:
    "Leading CPCT exam preparation platform in Madhya Pradesh with free mock tests, MCQ practice, and typing tests.",
  foundingDate: "2023",
  knowsAbout: [
    "CPCT Exam Preparation",
    "Computer Proficiency Certification Test",
    "Hindi Typing Practice",
    "English Typing Practice",
    "CPCT Mock Test",
    "Government Job Exam MP",
  ],
  areaServed: MP_CITIES.map((city) => ({
    "@type": "City",
    name: city,
    addressRegion: "Madhya Pradesh",
    addressCountry: "IN",
  })),
};

// Course/Product schema for CPCT prep
const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "CPCT Exam Preparation 2026",
  description:
    "Complete CPCT preparation course with mock tests, topic-wise MCQ, Hindi and English typing practice, and previous year papers. Free for all students in Madhya Pradesh.",
  url: "https://cpct.in",
  provider: {
    "@type": "Organization",
    name: "CPCT.IN",
    url: "https://cpct.in",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    category: "Free",
  },
  hasCourseInstance: [
    {
      "@type": "CourseInstance",
      name: "CPCT Mock Test Series",
      courseMode: "Online",
      inLanguage: ["hi-IN", "en-IN"],
    },
    {
      "@type": "CourseInstance",
      name: "CPCT Typing Practice",
      courseMode: "Online",
      inLanguage: ["hi-IN", "en-IN"],
    },
    {
      "@type": "CourseInstance",
      name: "CPCT Topic-wise MCQ Practice",
      courseMode: "Online",
    },
  ],
  educationalLevel: "Intermediate",
  teaches: [
    "Computer Fundamentals",
    "MS Office",
    "Hindi Typing",
    "English Typing",
    "General Knowledge",
    "Quantitative Aptitude",
  ],
  audience: {
    "@type": "Audience",
    audienceType: "CPCT Aspirants Madhya Pradesh",
  },
  locationCreated: {
    "@type": "State",
    name: "Madhya Pradesh",
    addressCountry: "IN",
  },
};

// FAQPage schema for AEO – answers AI engines surface directly
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CPCT exam?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT (Computer Proficiency Certification Test) is a government certification exam conducted by MAP_IT in Madhya Pradesh to test computer and typing skills for MP government jobs.",
      },
    },
    {
      "@type": "Question",
      name: "How to prepare for CPCT exam 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Practice free CPCT mock tests, topic-wise MCQ on CPCT.IN, improve Hindi and English typing speed to 30+ WPM, study computer fundamentals, MS Office, and general knowledge. CPCT.IN provides free complete preparation material.",
      },
    },
    {
      "@type": "Question",
      name: "What is the typing speed required for CPCT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT requires a minimum typing speed of 30 words per minute (WPM) in Hindi and 30 WPM in English. You can practice free typing tests on CPCT.IN.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I find free CPCT mock test online in Madhya Pradesh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT.IN is the best free platform for CPCT mock tests in MP. Students from Bhopal, Indore, Jabalpur, Narmadapuram, Itarsi, Gwalior and all MP cities use CPCT.IN for free CPCT practice.",
      },
    },
    {
      "@type": "Question",
      name: "Is CPCT.IN free for CPCT preparation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, CPCT.IN is completely free. It offers free CPCT mock tests, topic-wise MCQ, Hindi typing practice, English typing practice, and study materials with no subscription needed.",
      },
    },
    {
      "@type": "Question",
      name: "What is the syllabus of CPCT exam 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT 2026 syllabus includes: Computer Fundamentals, MS Office (Word, Excel, PowerPoint), Internet & Networking, General Awareness, Quantitative Aptitude, Hindi Typing (Mangal/Kruti font), and English Typing.",
      },
    },
    {
      "@type": "Question",
      name: "Best CPCT coaching in Bhopal Indore Narmadapuram?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPCT.IN is the top-rated online CPCT preparation platform serving students in Bhopal, Indore, Narmadapuram, Itarsi, Jabalpur, Gwalior, Ujjain and all cities of Madhya Pradesh – completely free of cost.",
      },
    },
  ],
};

// BreadcrumbList for site navigation clarity
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "CPCT Mock Test",
      item: "https://cpct.in/mock-test",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "CPCT Typing Practice",
      item: "https://cpct.in/typing-test",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "CPCT MCQ Practice",
      item: "https://cpct.in/mcq",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "CPCT Study Material",
      item: "https://cpct.in/study-material",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "CPCT Previous Year Papers",
      item: "https://cpct.in/previous-papers",
    },
  ],
};

// SiteLinksSearchBox for Google search box
const sitelinksSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: "https://cpct.in/",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://cpct.in/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// LocalBusiness schema for top MP cities
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
].map((city) => ({
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  name: `CPCT.IN – CPCT Preparation ${city}`,
  url: "https://cpct.in",
  description: `Best free CPCT mock test and MCQ practice platform for students in ${city}, Madhya Pradesh. Prepare for CPCT exam with Hindi English typing tests and topic-wise practice.`,
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
  serviceArea: { "@type": "City", name: city },
}));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en-IN" suppressHydrationWarning>
        <head>
          {/* ── GEO SEO: State + City Coordinates (MP center) ── */}
          <meta name="geo.region" content="IN-MP" />
          <meta name="geo.placename" content="Madhya Pradesh, India" />
          <meta name="geo.position" content="22.9734;78.6569" />
          <meta name="ICBM" content="22.9734, 78.6569" />

          {/* ── Bing / Yahoo Verification ── */}
          <meta name="msvalidate.01" content="C149C8E7815A485AEC7CADE07178D3EC" />

          {/* ── AEO: Speakable for voice & AI search ── */}
          <meta name="speakable" content="title,description" />

          {/* ── AI/LLM Search Discoverability ── */}
          <meta name="revisit-after" content="3 days" />
          <meta name="rating" content="general" />
          <meta name="target" content="all" />
          <meta name="HandheldFriendly" content="True" />
          <meta name="MobileOptimized" content="320" />

          {/* ── Language + Region Hreflang ── */}
          <link rel="alternate" hrefLang="en-IN" href="https://cpct.in" />
          <link rel="alternate" hrefLang="hi-IN" href="https://cpct.in/hi" />
          <link rel="alternate" hrefLang="x-default" href="https://cpct.in" />

          {/* ── RSS / Atom for crawlers ── */}
          <link rel="alternate" type="application/rss+xml" title="CPCT.IN Feed" href="https://cpct.in/feed.xml" />

          {/* ── Preconnect performance ── */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* ── Icons ── */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#0f172a" />

          {/* ── Speakable Schema (AEO for voice/AI) ── */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                speakable: {
                  "@type": "SpeakableSpecification",
                  cssSelector: ["h1", "h2", ".speakable"],
                },
                url: "https://cpct.in",
              }),
            }}
          />
        </head>

        <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased`}
        >
          {/* ── Google AdSense ── */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7991231452123187"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />

          {/* ══ STRUCTURED DATA SCHEMAS ══ */}

          {/* 1. Website + SearchAction */}
          <Script
            id="schema-website"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />

          {/* 2. Organization */}
          <Script
            id="schema-organization"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />

          {/* 3. Course (CPCT Preparation) */}
          <Script
            id="schema-course"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
          />

          {/* 4. FAQ – AEO for AI, Google, Bing answer boxes */}
          <Script
            id="schema-faq"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />

          {/* 5. Breadcrumbs */}
          <Script
            id="schema-breadcrumb"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />

          {/* 6. SiteLinksSearchBox */}
          <Script
            id="schema-sitelinks"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(sitelinksSchema) }}
          />

          {/* 7. LocalBusiness schemas for top MP cities */}
          {localBusinessSchemas.map((schema, i) => (
            <Script
              key={`schema-local-${i}`}
              id={`schema-local-${i}`}
              type="application/ld+json"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}

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
