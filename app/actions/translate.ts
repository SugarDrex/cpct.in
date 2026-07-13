"use server";

// ============================================
// DEEPL SERVER-SIDE TRANSLATION ACTION
// ============================================
// This runs on the server so the API key is never exposed to the client.
// DeepL API Free: 500,000 characters/month

const DEEPL_API_KEY = process.env.NEXT_PUBLIC_DEEPL_API_KEY || ""; // Server-side env only
const DEEPL_ENDPOINT = "https://api-free.deepl.com/v2/translate";

const DEEPL_LANG_MAP: Record<string, string> = {
  en: "EN-US",
  hi: "HI",
  gu: "GU",
  bn: "BN",
  pa: "PA",
};

export async function translateWithDeepL(
  texts: string[],
  targetLang: string
): Promise<{ translations: string[]; quotaExceeded: boolean }> {
  if (!DEEPL_API_KEY) {
    console.warn("DEEPL_API_KEY not set in server environment");
    return { translations: texts, quotaExceeded: false };
  }

  if (texts.length === 0) return { translations: [], quotaExceeded: false };

  const target = DEEPL_LANG_MAP[targetLang] || targetLang.toUpperCase();

  try {
    const res = await fetch(DEEPL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      body: JSON.stringify({
        text: texts,
        target_lang: target,
        source_lang: "EN",
      }),
      // Server-side fetch doesn't have CORS issues
    });

    if (res.status === 456) {
      console.warn("DeepL quota exceeded (456)");
      return { translations: texts, quotaExceeded: true };
    }
    if (res.status === 429) {
      console.warn("DeepL rate limited (429)");
      return { translations: texts, quotaExceeded: false };
    }
    if (res.status === 403) {
      console.warn("DeepL auth failed (403)");
      return { translations: texts, quotaExceeded: false };
    }
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("DeepL API error:", res.status, errorData);
      return { translations: texts, quotaExceeded: false };
    }

    const data = await res.json();
    const translations = data.translations?.map((t: any) => t.text) || texts;

    return { translations, quotaExceeded: false };
  } catch (err: any) {
    console.error("DeepL server action failed:", err.message);
    return { translations: texts, quotaExceeded: false };
  }
}