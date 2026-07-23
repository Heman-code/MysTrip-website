import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { withDbRetry } from "@/lib/db/withRetry";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  let record;
  try {
    [record] = await withDbRetry(() =>
      db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.tokenHash, tokenHash),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1)
    );
  } catch {
    return NextResponse.json({ error: "We couldn't reach the database. Please try again in a moment." }, { status: 503 });
  }

  if (!record) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await withDbRetry(() => db.update(users).set({ passwordHash }).where(eq(users.id, record.userId)));
    await withDbRetry(() =>
      db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id))
    );
  } catch {
    return NextResponse.json({ error: "We couldn't reach the database. Please try again in a moment." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
