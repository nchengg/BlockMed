import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

// Delete the session row and clear the cookie. Server-side deletion is the
// point: the token is dead immediately, not merely forgotten by the browser.
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
