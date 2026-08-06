import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isSuperAdminRole } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;
  if (!session || !isSuperAdminRole(sessionUser?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();
  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (id === sessionUser?.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.role === "super_admin") {
    return NextResponse.json({ error: "Cannot change a super admin's role" }, { status: 400 });
  }

  await db.update(users).set({ role }).where(eq(users.id, id));

  return NextResponse.json({ id, role });
}
