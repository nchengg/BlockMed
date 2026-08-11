// Server-side authentication: password hashing, session issue/verify, and the
// httpOnly cookie that carries the session token.
//
// This replaces the mock auth (lib/authStore.tsx), which was explicitly "not a
// security boundary": it looked an account up by email with no credential, and
// the client then told the server who it was on every request. Here the server
// issues the session and is the only thing that can read it.
//
// Design follows docs/auth-mechanism.md (Q18, Option C): one session backbone
// for every route and role, with email+password as the login method. SIWE and
// wallet linking slot in later as an additional method against the same
// session — no change to what the API trusts.
//
// Deliberate choices:
//   • httpOnly cookie, never localStorage — a token readable by injected script
//     is unacceptable on a surface that moves money.
//   • Opaque random token stored server-side, not a self-contained JWT, so a
//     session can be revoked immediately (logout, or a compromised account).
//   • SameSite=Lax blocks the common cross-site POST; combined with the
//     same-origin API this is the CSRF defence for now.
import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const SESSION_COOKIE = 'bm_session';
const SESSION_DAYS = 7;
/** Cost factor for bcrypt. 12 is the usual floor for new systems. */
const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** The account shape the app passes around — never includes the password hash. */
export type SessionAccount = {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  country: string;
  type: string;
  /** The linked wallet, or null until one is proven via SIWE. */
  walletAddress: string | null;
  walletLinkedAt: Date | null;
};

const ACCOUNT_FIELDS = {
  id: true, email: true, companyName: true, contactName: true, country: true, type: true,
  walletAddress: true, walletLinkedAt: true,
} as const;

/** Issue a session and set the cookie. Called after signup and after login. */
export async function createSession(accountId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await prisma.session.create({ data: { token, accountId, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

/**
 * The signed-in account, resolved SERVER-SIDE from the cookie — or null.
 * This is the only identity the API may trust. Expired sessions are deleted
 * as they are encountered, so the table self-cleans.
 */
export async function getSessionAccount(): Promise<SessionAccount | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { account: { select: ACCOUNT_FIELDS } },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return session.account;
}

/** Drop the session server-side and clear the cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}
