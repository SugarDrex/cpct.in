import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",    
      disallow: "/api/",  
    },
    sitemap: "https://cpct.in/sitemap.xml",
    host: "https://cpct.in",
  };
}

