// Zero server-only imports — safe to import from both server code and "use
// client" components (unlike lib/referral.ts, which pulls in the DB client).
export const REFERRAL_COOKIE = "mystrip_ref";

// Generic cookie reader — works with both next/headers cookies() (server
// components) and NextRequest.cookies (route handlers), since both expose the
// same .get(name) -> { value } shape.
export function readReferralCode(cookieStore: { get(name: string): { value: string } | undefined }) {
  return cookieStore.get(REFERRAL_COOKIE)?.value ?? null;
}
