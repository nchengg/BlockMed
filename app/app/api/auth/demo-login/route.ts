import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth/session';
import { demoLoginEnabled, isDemoAccount } from '@/lib/auth/demoMode';

export const dynamic = 'force-dynamic';

// Passwordless sign-in for the demo account switcher.
//
// This issues a REAL session with no credential, so it is gated twice:
//
//   1. ESCROW_DEMO_LOGIN=1 and a non-production build. Off by default — a
//      deployment that forgets the variable is closed, not open.
//   2. The target must be a seeded demo account (@demo.blockmediary.test).
//      A real company's account can never be entered without its password,
//      whatever mode the server is in.
//
// Previously it accepted ANY client account id, and /api/escrow/companies
// published those ids unauthenticated — so two requests and no credentials got
// you a session as any company on the platform, with their deals. Both halves
// are fixed; this is the half that mattered.
export async function POST(req: Request) {
  if (!demoLoginEnabled()) {
    // Deliberately vague and 404: an attacker learns nothing about whether the
    // route exists or which accounts are demo accounts.
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { accountId?: string };
  const accountId = typeof body.accountId === 'string' ? body.accountId : '';

  if (!accountId) {
    return NextResponse.json({ ok: false, error: 'Choose a demo company.' }, { status: 400 });
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, type: 'client' },
    select: {
      id: true,
      email: true,
      companyName: true,
      contactName: true,
      country: true,
      type: true,
      walletAddress: true,
      walletLinkedAt: true,
    },
  });

  // One response for "no such account" and "not a demo account" — the caller
  // should not be able to enumerate real accounts by watching the error change.
  if (!account || !isDemoAccount(account.email)) {
    return NextResponse.json({ ok: false, error: 'Demo company not found.' }, { status: 404 });
  }

  await createSession(account.id);
  return NextResponse.json({ ok: true, account });
}
