import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "admin_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET env var");
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload;
}

export function getTokenFromCookies() {
  return cookies().get(AUTH_COOKIE_NAME)?.value || null;
}

export async function requireAuth() {
  const token = getTokenFromCookies();
  if (!token) return null;
  try {
    const payload = await verifyAuthToken(token);
    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

