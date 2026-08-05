import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { payouts } from "@/lib/db/schema";

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
  const { action } = await req.json();
  if (action !== "mark_paid") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const [payout] = await db.select({ id: payouts.id, status: payouts.status }).from(payouts).where(eq(payouts.id, id)).limit(1);
  if (!payout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }
  if (payout.status === "paid") {
    return NextResponse.json({ error: "Already marked paid" }, { status: 409 });
  }

  await db.update(payouts).set({ status: "paid", paidAt: new Date() }).where(eq(payouts.id, id));

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
