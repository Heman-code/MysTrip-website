import type { MetadataRoute } from "next";
import { getAllDbTripsForAdmin } from "@/lib/db/trips";

const BASE_URL = "https://www.mystrip.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trips = await getAllDbTripsForAdmin();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/trips`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/sundarone`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const tripRoutes: MetadataRoute.Sitemap = trips.map((t) => ({
    url: `${BASE_URL}/trips/${t.slug}`,
    lastModified: t.updatedAt ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...tripRoutes];
}
