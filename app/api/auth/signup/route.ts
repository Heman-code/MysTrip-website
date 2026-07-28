import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authRatelimit } from "@/lib/ratelimit";
import { issueWelcomeCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success, reset } = await authRatelimit.limit(`signup:${ip}`);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const { name, email, phone, password, college, hasTraveledBefore } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    // A row can exist without ever being an account: past travellers were
    // bulk-imported (by email) from before this website existed, purely so
    // their trip history is queryable. Only a real passwordHash means
    // someone actually signed up here before — that's the only case worth
    // blocking. Otherwise, turn the legacy row into their real account
    // in place (same id), so their existing registrations stay attached.
    if (existing?.passwordHash) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const isReturningTraveller = !!existing || !!hasTraveledBefore;

    let newUser: { id: string; email: string };
    if (existing) {
      [newUser] = await db
        .update(users)
        .set({
          fullName: name.trim(),
          phone: phone?.trim() || null,
          passwordHash,
          college: college?.trim() || null,
          hasTraveledBefore: true,
        })
        .where(eq(users.id, existing.id))
        .returning({ id: users.id, email: users.email });
    } else {
      [newUser] = await db
        .insert(users)
        .values({
          fullName: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() || null,
          passwordHash,
          college: college?.trim() || null,
          hasTraveledBefore: !!hasTraveledBefore,
        })
        .returning({ id: users.id, email: users.email });
    }

    const coupon = await issueWelcomeCoupon(newUser.id, isReturningTraveller);

    return NextResponse.json(
      {
        ok: true,
        userId: newUser.id,
        coupon: { code: coupon.code, discountPercent: coupon.discountPercent, maxDiscountAmount: Number(coupon.maxDiscountAmount) },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
