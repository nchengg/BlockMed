import { NextResponse } from 'next/server';
import { getSessionAccount } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Who am I? Resolved from the httpOnly cookie server-side — the client cannot
// read or forge it. The UI calls this on load to restore the session.
export async function GET() {
  const account = await getSessionAccount();
  return NextResponse.json({ ok: true, account });
}
