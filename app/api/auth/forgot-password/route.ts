import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { authRatelimit } from "@/lib/ratelimit";
import { sendPasswordResetEmail } from "@/lib/email";
import { withDbRetry } from "@/lib/db/withRetry";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await authRatelimit.limit(`forgot:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user;
  try {
    [user] = await withDbRetry(() => db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1));
  } catch {
    return NextResponse.json({ error: "We couldn't reach the database. Please try again in a moment." }, { status: 503 });
  }

  // Same response whether or not the account exists — avoids leaking who's registered.
  if (user?.passwordHash) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    try {
      await withDbRetry(() => db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id)));
      await withDbRetry(() => db.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt }));

      const resetUrl = `${req.nextUrl.origin}/auth/reset/${rawToken}`;
      await sendPasswordResetEmail(user.email, user.fullName, resetUrl);
    } catch (err) {
      // Don't let a transient DB blip leak "this email exists" via a different response shape.
      console.error("[forgot-password] Failed to create/send reset token:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
