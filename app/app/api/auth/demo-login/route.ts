import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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

  if (!account) {
    return NextResponse.json({ ok: false, error: 'Demo company not found.' }, { status: 404 });
  }

  await createSession(account.id);
  return NextResponse.json({ ok: true, account });
}
