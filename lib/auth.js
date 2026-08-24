import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const sessionCookieName = "fidgerSession";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export class AuthConfigError extends Error {}

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new AuthConfigError(
      "AUTH_SECRET is not set or too short. Add it to .env.local (see README step 4) and restart the dev server."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function verifyOwnerPassword(plainPassword) {
  const passwordHash = process.env.OWNER_PASSWORD_HASH;
  if (!passwordHash) {
    throw new AuthConfigError(
      "OWNER_PASSWORD_HASH is not set. Add it to .env.local (see README step 3) and restart the dev server."
    );
  }
  if (!plainPassword) {
    return false;
  }
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function createSessionToken() {
  const key = getAuthSecretKey();
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAgeSeconds}s`)
    .sign(key);
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const key = getAuthSecretKey();
    const { payload } = await jwtVerify(token, key);
    if (payload.role !== "owner") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = sessionCookieName;
