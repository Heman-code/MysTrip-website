import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ambassadors } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const [existing] = await db.select({ id: ambassadors.id }).from(ambassadors).where(eq(ambassadors.id, id)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Ambassador not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  const passthroughFields = ["tier", "instagramHandle", "upiId", "status", "discountType", "commissionType", "commissionBase", "notes"] as const;
  for (const field of passthroughFields) {
    if (field in body) updates[field] = body[field] || null;
  }
  if ("discountValue" in body) updates.discountValue = String(body.discountValue);
  if ("discountMaxCap" in body) updates.discountMaxCap = body.discountMaxCap !== "" && body.discountMaxCap !== null ? String(body.discountMaxCap) : null;
  if ("commissionValue" in body) updates.commissionValue = String(body.commissionValue);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  // Editing terms only ever affects bookings made after this point — every
  // past registration already has its discount/commission snapshotted, so
  // there's nothing else to reconcile here.
  await db.update(ambassadors).set(updates).where(eq(ambassadors.id, id));

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
