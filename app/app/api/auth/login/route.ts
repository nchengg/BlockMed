import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth/session';
import { normaliseEmail } from '@/lib/auth/validate';

// Email + password → session cookie.
//
// Failures return ONE generic message and always 401, whether the email is
// unknown or the password is wrong (TR-6.2.4: no information leakage about
// which part failed — otherwise this endpoint enumerates registered accounts).
const GENERIC = 'Email or password is incorrect.';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 401 });
  }

  const account = await prisma.account.findUnique({ where: { email } });
  if (!account) {
    // Hash anyway so a missing account is not measurably faster than a wrong
    // password — otherwise response time alone reveals which emails exist.
    await verifyPassword(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 401 });
  }

  if (!(await verifyPassword(password, account.passwordHash))) {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 401 });
  }

  await createSession(account.id);
  return NextResponse.json({
    ok: true,
    account: {
      id: account.id,
      email: account.email,
      companyName: account.companyName,
      contactName: account.contactName,
      country: account.country,
      type: account.type,
    },
  });
}
