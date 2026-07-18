import type { MetadataRoute } from "next";

const baseUrl = "https://cpct.in";

// ── Static Public Routes ──
const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${baseUrl}/`,           lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
  { url: `${baseUrl}/cpct`,       lastModified: new Date(), changeFrequency: "daily",  priority: 0.95 },
  { url: `${baseUrl}/cpct-about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${baseUrl}/cpct-exams`, lastModified: new Date(), changeFrequency: "daily",  priority: 0.95 },
  { url: `${baseUrl}/cpct-mcq`,   lastModified: new Date(), changeFrequency: "daily",  priority: 0.95 },
  { url: `${baseUrl}/cpct-new-exams`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
  { url: `${baseUrl}/cpct-notes`,    lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
  { url: `${baseUrl}/cpct-practice`, lastModified: new Date(), changeFrequency: "daily",  priority: 0.95 },
  { url: `${baseUrl}/cpct-tips`,     lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
  { url: `${baseUrl}/cpct-old-papers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${baseUrl}/cpct-in-contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  { url: `${baseUrl}/cpct-terms`,  lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  { url: `${baseUrl}/cpct-privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  { url: `${baseUrl}/faq`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${baseUrl}/exam`,        lastModified: new Date(), changeFrequency: "daily",  priority: 0.95 },
  { url: `${baseUrl}/newexams`,    lastModified: new Date(), changeFrequency: "daily",  priority: 0.95 },
  { url: `${baseUrl}/cpct/cpct-new-exam`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${baseUrl}/cpct/cpct-new-exam/take-exam`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
];

// ── Helper: fetch with timeout ──
async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

// ── Dynamic Route Generators ──
async function getExamRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const exams = await fetchWithTimeout(`${baseUrl}/api/admin/newexams`);
    if (!Array.isArray(exams)) return [];
    return exams.map((exam: any) => ({
      url: `${baseUrl}/cpct-new-exams/${exam._id ?? exam.id}`,
      lastModified: new Date(exam.updatedAt ?? exam.createdAt ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    return [];
  }
}

async function getNewExamRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const exams = await fetchWithTimeout(`${baseUrl}/api/admin/newexams`);
    if (!Array.isArray(exams)) return [];
    return exams.map((exam: any) => ({
      url: `${baseUrl}/newexams/${exam._id ?? exam.id}`,
      lastModified: new Date(exam.updatedAt ?? exam.createdAt ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    return [];
  }
}

async function getCpctNewExamRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const exams = await fetchWithTimeout(`${baseUrl}/api/admin/newexams`);
    if (!Array.isArray(exams)) return [];
    return exams.map((exam: any) => ({
      url: `${baseUrl}/cpct/cpct-new-exam/${exam._id ?? exam.id}`,
      lastModified: new Date(exam.updatedAt ?? exam.createdAt ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    return [];
  }
}

async function getCpctExamRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const exams = await fetchWithTimeout(`${baseUrl}/api/admin/newexams`);
    if (!Array.isArray(exams)) return [];
    return exams.map((exam: any) => ({
      url: `${baseUrl}/cpct-exams/${exam._id ?? exam.id}`,
      lastModified: new Date(exam.updatedAt ?? exam.createdAt ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    return [];
  }
}

async function getNotesRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const notes = await fetchWithTimeout(`${baseUrl}/api/notes`);
    if (!Array.isArray(notes)) return [];
    return notes.map((note: any) => ({
      url: `${baseUrl}/cpct-notes/${note._id ?? note.id}`,
      lastModified: new Date(note.updatedAt ?? note.createdAt ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    return [];
  }
}

async function getMcqTopicRoutes(): Promise<MetadataRoute.Sitemap> {
  // Hard-coded high-value CPCT MCQ topics (SEO keywords baked in)
  const topics = [
    "fundamentals-of-computer",
    "operating-system",
    "ms-word",
    "ms-excel",
    "ms-powerpoint",
    "internet-and-web",
    "computer-networks",
    "email-basics",
    "typing-speed-test",
    "cpct-syllabus",
    "cpct-mock-test",
    "cpct-previous-papers",
  ];
  return topics.map((topic) => ({
    url: `${baseUrl}/cpct-mcq/${topic}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
}

async function getResultRoutes(): Promise<MetadataRoute.Sitemap> {
  // Results are user-specific; generally no-index, but if public leaderboards exist:
  return [];
}

// ── Main Sitemap Export ──
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    examRoutes,
    newExamRoutes,
    cpctNewExamRoutes,
    cpctExamRoutes,
    notesRoutes,
    mcqTopicRoutes,
  ] = await Promise.all([
    getExamRoutes(),
    getNewExamRoutes(),
    getCpctNewExamRoutes(),
    getCpctExamRoutes(),
    getNotesRoutes(),
    getMcqTopicRoutes(),
  ]);

  return [
    ...staticRoutes,
    ...examRoutes,
    ...newExamRoutes,
    ...cpctNewExamRoutes,
    ...cpctExamRoutes,
    ...notesRoutes,
    ...mcqTopicRoutes,
  ];
}
