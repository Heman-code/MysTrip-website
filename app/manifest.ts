import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MysTrip — Your Travel Tribe",
    short_name: "MysTrip",
    description: "India's youth travel community. Treks, explorations, and adventures for college students.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1210",
    theme_color: "#FF6016",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
