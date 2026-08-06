import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { isAdminRole } from "@/lib/admin-auth";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string) {
  let slug = base;
  let n = 1;
  while (true) {
    const [existing] = await db.select({ id: trips.id }).from(trips).where(eq(trips.slug, slug)).limit(1);
    if (!existing) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, shortTitle, destination, state, source, category, difficulty,
    tripDate, returnDate, departureTime, returnTime,
    basePrice, maxSlots, minSlots,
    shortDescription, description, highlights, inclusions, exclusions,
    coverImage, tag, tagColor, accentColor, registrationOpen, status,
  } = body ?? {};

  const requiredFields = { title, destination, source, category, tripDate, basePrice, maxSlots };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === "") {
      return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
    }
  }

  const slug = await uniqueSlug(slugify(title));

  const [trip] = await db
    .insert(trips)
    .values({
      slug,
      title,
      shortTitle: shortTitle || title,
      destination,
      state: state || null,
      source,
      category,
      status: status || "open",
      tripDate,
      returnDate: returnDate || null,
      departureTime: departureTime || null,
      returnTime: returnTime || null,
      basePrice: String(basePrice),
      maxSlots: Number(maxSlots),
      minSlots: minSlots ? Number(minSlots) : 10,
      shortDescription: shortDescription || null,
      description: description || null,
      highlights: Array.isArray(highlights) ? highlights : [],
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      exclusions: Array.isArray(exclusions) ? exclusions : [],
      difficulty: difficulty || "Easy",
      coverImage: coverImage || null,
      tag: tag || null,
      tagColor: tagColor || null,
      accentColor: accentColor || null,
      registrationOpen: !!registrationOpen,
    })
    .returning({ id: trips.id, slug: trips.slug });

  revalidatePath("/", "layout");
  revalidatePath("/trips");
  revalidatePath("/sundarone");

  return NextResponse.json({ ok: true, trip }, { status: 201 });
}
