import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/NavBar";
import { Poppins, Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
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

export const metadata: Metadata = {
  metadataBase: new URL("https://cpct.in"),

  title: {
    default:
      "CPCT.IN – Best CPCT Exam Preparation Platform in M.P. | Free CPCT Typing Practice Hindi & English",
    template: "%s | CPCT.IN",
  },

  description:
    "Prepare for CPCT 2026 with free CPCT mock tests, Hindi and English typing practice, previous year question papers and study material. CPCT.IN is Madhya Pradesh's trusted CPCT preparation platform.",

  keywords: [
    "CPCT mock test",
    "CPCT mock test 2026",
    "Free CPCT mock test online",
    "CPCT typing practice Hindi",
    "CPCT typing practice English",
    "CPCT previous year question papers",
    "CPCT study material PDF",
    "CPCT exam preparation 2026",
    "CPCT online practice test",
    "CPCT coaching Madhya Pradesh",
    "CPCT typing test Hindi English",
    "CPCT exam guide MP"
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
  },

  openGraph: {
    type: "website",
    url: "https://cpct.in",
    title: "CPCT Mock Test 2026 | Free Typing Practice",
    description:
      "Practice CPCT mock tests, Hindi English typing tests, download study material and previous year papers.",
    siteName: "CPCT.IN",
    locale: "en_IN",
    images: [
      {
        url: "https://cpct.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CPCT Mock Test Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CPCT Mock Test 2026",
    description:
      "Prepare for CPCT exam with free mock tests, typing practice Hindi English and study materials.",
    images: ["https://cpct.in/og-image.jpg"],
  },

  category: "education",

  verification: {
    google: "fanrHlaXVWTXhgOc2jRdFARAHtqrd1tLil9ANeXZnsY",
    other: {
      "msvalidate.01": "BING_VERIFICATION_CODE",
    },
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<>
    <html lang="en-IN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased`}
      >
  <Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7991231452123187"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>

        {/* GEO SEO meta */}
        <meta name="geo.region" content="IN-MP" />
        <meta name="geo.placename" content="Madhya Pradesh, India" />
        <meta name="geo.position" content="22.7441;77.7369" />
        <meta name="ICBM" content="22.7441,77.7369" />
        <meta name="msvalidate.01" content="C149C8E7815A485AEC7CADE07178D3EC" />
        <meta name="theme-color" content="#0f172a" />
      
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <Script
          id="schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalWebSite",
              name: "CPCT.IN",
              url: "https://cpct.in",
              description:
                "Online platform for CPCT exam preparation including mock tests, typing practice and study materials.",
              inLanguage: "en-IN",
              publisher: {
                "@type": "Organization",
                name: "CPCT.IN",
                logo: {
                  "@type": "ImageObject",
                  url: "https://cpct.in/logo.png",
                },
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://cpct.in/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
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
  </>);
}
