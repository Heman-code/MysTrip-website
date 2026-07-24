import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { code } = await req.json();
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
  }

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.trim().toUpperCase()))
    .limit(1);

  if (!coupon) {
    return NextResponse.json({ error: "That code doesn't exist. Double-check and try again." }, { status: 404 });
  }
  if (coupon.userId !== session.user.id) {
    return NextResponse.json({ error: "That coupon belongs to someone else's account." }, { status: 403 });
  }
  if (coupon.isUsed) {
    return NextResponse.json({ error: "That coupon's already been used." }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    coupon: {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      maxDiscountAmount: Number(coupon.maxDiscountAmount),
    },
  });
}
