import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const cookieName = "wigy-admin";

function secret() {
  const value = process.env.WIGY_ADMIN_PASSWORD;
  if (!value) throw new Error("WIGY_ADMIN_PASSWORD is not configured.");
  return value;
}

function signature() {
  return createHmac("sha256", secret()).update("wigy-admin-session-v1").digest("hex");
}

export async function isAdmin() {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const expected = signature();
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function signIn(password: string) {
  const valid = password.length === secret().length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(secret()));
  if (!valid) return false;
  (await cookies()).set(cookieName, signature(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(cookieName);
}
