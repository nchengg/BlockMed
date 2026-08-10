import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionAccount } from '@/lib/auth/session';
import { demoLoginEnabled, DEMO_EMAIL_DOMAIN } from '@/lib/auth/demoMode';

export const dynamic = 'force-dynamic';

// The counterparty picker: which companies a signed-in user can address a deal to.
//
// Two things changed here, both because this list was a directory of every
// account on the platform, served to anyone who asked:
//
//   • It now requires a session. Naming a counterparty is something a user does
//     from inside the product, so there is no reason to publish it publicly.
//   • Emails are gone. The picker needs a name and an id to address a deal;
//     the email was never used for that, and publishing it turned this into a
//     harvestable contact list.
//
// The one exception is the demo switcher, which needs to list demo accounts
// BEFORE anyone is signed in — that is the whole point of it. That path returns
// only seeded demo accounts, and only when demo mode is on.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeSelf = url.searchParams.get('includeSelf') === '1';
  const forDemoSwitcher = url.searchParams.get('demo') === '1';
  const me = await getSessionAccount();

  if (forDemoSwitcher) {
    if (!demoLoginEnabled()) {
      return NextResponse.json({ ok: true, companies: [] });
    }
    const demo = await prisma.account.findMany({
      where: { type: 'client', email: { endsWith: DEMO_EMAIL_DOMAIN } },
      select: { id: true, companyName: true },
      orderBy: { companyName: 'asc' },
    });
    return NextResponse.json({
      ok: true,
      companies: demo.map(c => ({ accountId: c.id, displayName: c.companyName })),
    });
  }

  if (!me) {
    return NextResponse.json({ ok: false, error: 'Sign in first.' }, { status: 401 });
  }

  const companies = await prisma.account.findMany({
    where: { type: 'client', ...(includeSelf ? {} : { id: { not: me.id } }) },
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' },
  });

  return NextResponse.json({
    ok: true,
    companies: companies.map(c => ({ accountId: c.id, displayName: c.companyName })),
  });
}
