import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionAccount } from '@/lib/auth/session';
import {
  buildSiweMessage, normaliseAddress, verifyWalletSignature, nonceExpired,
} from '@/lib/auth/siwe';

// Step 2 of wallet linking: verify the signature and record the address.
//
// The server rebuilds the message from ITS OWN stored nonce rather than trusting
// a message the client sends back — otherwise a caller could sign a message of
// their choosing and have it accepted.
//
// One generic failure for every rejection: a caller should not learn whether the
// nonce was wrong, expired, or the signature simply did not match.
const GENERIC = 'Could not verify that wallet. Try linking again.';

export async function POST(req: Request) {
  const account = await getSessionAccount();
  if (!account) {
    return NextResponse.json({ ok: false, error: 'Sign in first.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    address?: string;
    signature?: string;
    issuedAt?: string;
  };

  const address = normaliseAddress(body.address ?? '');
  if (!address || typeof body.signature !== 'string' || typeof body.issuedAt !== 'string') {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }

  const challenge = await prisma.walletNonce.findFirst({ where: { accountId: account.id } });
  if (!challenge) {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }

  // Single use, whatever the outcome: consume it before verifying so a failed
  // attempt cannot be retried against the same nonce.
  await prisma.walletNonce.delete({ where: { nonce: challenge.nonce } }).catch(() => {});

  if (nonceExpired(challenge.expiresAt)) {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }

  const message = buildSiweMessage({
    domain: new URL(req.url).host,
    address,
    nonce: challenge.nonce,
    issuedAt: body.issuedAt,
  });

  const result = await verifyWalletSignature(address, message, body.signature);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }

  // One address per company: the contract's per-deal party checks would be
  // ambiguous if two accounts shared one, and a deposit could be misattributed.
  const claimed = await prisma.account.findUnique({
    where: { walletAddress: result.address },
    select: { id: true },
  });
  if (claimed && claimed.id !== account.id) {
    return NextResponse.json(
      { ok: false, error: 'That wallet is already linked to another company.' },
      { status: 409 },
    );
  }

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: { walletAddress: result.address, walletLinkedAt: new Date() },
    select: { id: true, companyName: true, walletAddress: true, walletLinkedAt: true },
  });

  return NextResponse.json({ ok: true, account: updated });
}

// Unlink — useful when a company changes wallet, and needed so a mistake is
// recoverable. Deliberately does not touch existing deals: an on-chain deal
// already names the address it was created with, and rewriting history to
// match a new wallet would make the audit trail lie.
export async function DELETE() {
  const account = await getSessionAccount();
  if (!account) {
    return NextResponse.json({ ok: false, error: 'Sign in first.' }, { status: 401 });
  }
  await prisma.account.update({
    where: { id: account.id },
    data: { walletAddress: null, walletLinkedAt: null },
  });
  return NextResponse.json({ ok: true });
}
