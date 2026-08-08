import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionAccount } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeSelf = url.searchParams.get('includeSelf') === '1';
  const me = await getSessionAccount();

  const companies = await prisma.account.findMany({
    where: { type: 'client', ...(me && !includeSelf ? { id: { not: me.id } } : {}) },
    select: { id: true, companyName: true, email: true },
    orderBy: { companyName: 'asc' },
  });

  return NextResponse.json({
    ok: true,
    companies: companies.map(c => ({
      accountId: c.id,
      displayName: c.companyName,
      email: c.email,
    })),
  });
}
