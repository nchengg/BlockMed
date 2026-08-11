import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/db';
import { getSessionAccount } from '@/lib/auth/session';
import { buildSiweMessage, normaliseAddress, NONCE_TTL_MINUTES } from '@/lib/auth/siwe';

// Step 1 of wallet linking: issue a single-use challenge.
//
// Requires an existing session — this links a wallet to an account you are
// already signed in to. It is not a login method, so a wallet-less account
// (platform/intermediary) never has to come through here.
export async function POST(req: Request) {
  const account = await getSessionAccount();
  if (!account) {
    return NextResponse.json({ ok: false, error: 'Sign in first.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { address?: string };
  const address = normaliseAddress(body.address ?? '');
  if (!address) {
    return NextResponse.json({ ok: false, error: 'Not a valid Ethereum address.' }, { status: 400 });
  }

  // Clear any earlier challenge for this account: only the newest may be used,
  // so an abandoned attempt cannot be completed later.
  await prisma.walletNonce.deleteMany({ where: { accountId: account.id } });

  const nonce = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + NONCE_TTL_MINUTES * 60_000);
  await prisma.walletNonce.create({ data: { nonce, accountId: account.id, expiresAt } });

  const message = buildSiweMessage({
    domain: new URL(req.url).host,
    address,
    nonce,
    issuedAt: new Date().toISOString(),
  });

  // The message is returned whole so the client signs exactly what the server
  // will verify — reconstructing it client-side would let the two drift apart.
  return NextResponse.json({ ok: true, message, nonce, expiresAt: expiresAt.toISOString() });
}
