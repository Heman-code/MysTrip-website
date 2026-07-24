import { NextRequest, NextResponse } from "next/server";
import { getDbTripBySlug } from "@/lib/db/trips";

// Map slug → internal storage URL (never exposed to client)
const ITINERARY_URLS: Record<string, string> = {
  // Add real Supabase/R2 URLs here when PDFs are uploaded
  // "sundarone-sunrise-to-skyline-jul-25": "https://storage.example.com/itineraries/sunrise-to-skyline.pdf",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const trip = await getDbTripBySlug(slug);

  if (!trip) {
    return new NextResponse("Trip not found", { status: 404 });
  }

  const url = ITINERARY_URLS[slug];
  if (!url) {
    return new NextResponse("Itinerary not yet available for this trip.", { status: 404 });
  }

  // Proxy the PDF — storage URL never reaches the browser
  const upstream = await fetch(url, { next: { revalidate: 3600 } });
  if (!upstream.ok) {
    return new NextResponse("Failed to fetch itinerary", { status: 502 });
  }

  const pdf = await upstream.arrayBuffer();
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      // Allow inline viewing but block download
      "Content-Disposition": `inline; filename="${slug}-itinerary.pdf"`,
      "Cache-Control": "public, max-age=3600",
      // Prevent the PDF URL from appearing in Referer headers
      "Referrer-Policy": "no-referrer",
    },
  });
}
