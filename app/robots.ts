import type { MetadataRoute } from "next";

const BASE_URL = "https://www.mystrip.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api", "/auth/reset", "/trips/*/register"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
