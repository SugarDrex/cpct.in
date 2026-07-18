import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://cpct.in";

  return {
    // ═══════════════════════════════════════════════════════════════════════
    // ══════════════ GENERAL RULES (All Bots) ═════════════════════════════
    // ═══════════════════════════════════════════════════════════════════════
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/cpct",
          "/cpct-exams",
          "/cpct-mcq",
          "/cpct-notes",
          "/cpct-practice",
          "/cpct-old-papers",
          "/cpct-tips",
          "/cpct-about",
          "/faq",
          "/sitemap.xml",
          "/feed.xml",
          "/feed.atom",
        ],
        disallow: [
          "/admin",
          "/api",
          "/login",
          "/logout",
          "/_not-found",
          "/result",
          "/newresult",
          "/.next",
          "/node_modules",
          "/*?*sort=",
          "/*?*filter=",
          "/*?*page=2",
          "/*?*utm_",
          "/*?*session=",
        ],
        crawlDelay: 1,
        requestRate: "30/1m",
      },

      // ═══════════════════════════════════════════════════════════════════
      // ══════════════ GOOGLE BOT (Highest Priority) ════════════════════
      // ═══════════════════════════════════════════════════════════════════
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login", "/_not-found"],
        crawlDelay: 0,
        requestRate: "100/1m",
      },

      // ═══════════════════════════════════════════════════════════════════
      // ══════════════ BING BOT ═══════════════════════════════════════════
      // ═══════════════════════════════════════════════════════════════════
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login", "/_not-found"],
        crawlDelay: 1,
        requestRate: "30/1m",
      },

      // ═══════════════════════════════════════════════════════════════════
      // ══════════════ YANDEX BOT ═════════════════════════════════════════
      // ═══════════════════════════════════════════════════════════════════
      {
        userAgent: "YandexBot",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login", "/_not-found"],
        crawlDelay: 2,
        requestRate: "20/1m",
      },

      // ═══════════════════════════════════════════════════════════════════
      // ══════════ AI CHATBOT & ANSWER ENGINE ACCESS ═══════════════════════
      // ═══════════════════════════════════════════════════════════════════
      {
        userAgent: "Claude",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login"],
      },
      {
        userAgent: "Gemini",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login"],
      },
      {
        userAgent: "Perplexity",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login"],
      },
      {
        userAgent: "CCBot",
        allow: ["/"],
        disallow: ["/admin", "/api", "/login"],
      },

      // ═══════════════════════════════════════════════════════════════════
      // ══════════ SOCIAL MEDIA CRAWLERS ══════════════════════════════════
      // ═══════════════════════════════════════════════════════════════════
      {
        userAgent: "facebookexternalhit",
        allow: ["/"],
      },
      {
        userAgent: "Twitterbot",
        allow: ["/"],
      },
      {
        userAgent: "LinkedInBot",
        allow: ["/"],
      },
      {
        userAgent: "Pinterest",
        allow: ["/"],
      },
      {
        userAgent: "WhatsApp",
        allow: ["/"],
      },

      // ═══════════════════════════════════════════════════════════════════
      // ══════════ BLOCK BAD BOTS & SCRAPERS ══════════════════════════════
      // ═══════════════════════════════════════════════════════════════════
      {
        userAgent: [
          "MJ12bot",
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MojeekBot",
          "SiteAuditBot",
          "SEOkicks",
          "SEMrushBot",
        ],
        disallow: ["/"],
      },
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // ═══════════════════ SITEMAP LOCATIONS ════════════════════════════════
    // ═══════════════════════════════════════════════════════════════════════
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-pages.xml`,
      `${baseUrl}/sitemap-exams.xml`,
      `${baseUrl}/sitemap-mcq.xml`,
      `${baseUrl}/sitemap-notes.xml`,
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // ═════════════════ HOST SPECIFICATION ════════════════════════════════
    // ═══════════════════════════════════════════════════════════════════════
    host: "https://cpct.in",
  };
}
