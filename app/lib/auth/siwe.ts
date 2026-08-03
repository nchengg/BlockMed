// Sign-In With Ethereum (EIP-4361) message construction and checking.
//
// WHY A SIGNATURE AT ALL: storing an address someone typed proves nothing —
// anyone can enter anyone's address. The only proof of control is a signature
// from that address's private key over a message the server chose.
//
// The nonce is what makes it single-use. Without one, a signature captured from
// anywhere (a phishing site, a previous session, another dApp) could be replayed
// to link a wallet the attacker does not control. The server issues a nonce,
// stores it against the account, and deletes it on use.
//
// The message is deliberately human-readable, because the user is asked to sign
// it in their wallet and should be able to tell what they are agreeing to. It
// links an address to an ALREADY AUTHENTICATED account — this is wallet linking,
// not login. Login stays email+password, so wallet-less accounts (the
// platform/intermediary case) keep working.
import { verifyMessage, isAddress, getAddress } from 'viem';

export const NONCE_TTL_MINUTES = 10;

export type SiweParams = {
  domain: string;
  address: string;
  nonce: string;
  issuedAt: string;
  statement?: string;
};

/**
 * Build the message the wallet signs. Format follows EIP-4361 closely enough
 * that wallets render it sensibly, without pulling in a dependency for what is
 * ultimately a fixed string.
 */
export function buildSiweMessage(p: SiweParams): string {
  const statement =
    p.statement ??
    'Link this wallet to your Blockmediary account. This proves you control the address. It does not authorise any transaction or spend any funds.';
  return [
    `${p.domain} wants you to sign in with your Ethereum account:`,
    p.address,
    '',
    statement,
    '',
    `URI: https://${p.domain}`,
    'Version: 1',
    `Nonce: ${p.nonce}`,
    `Issued At: ${p.issuedAt}`,
  ].join('\n');
}

/** Addresses are compared in checksummed form so case never causes a mismatch. */
export function normaliseAddress(address: string): string | null {
  if (typeof address !== 'string' || !isAddress(address)) return null;
  return getAddress(address);
}

export type VerifyResult =
  | { ok: true; address: string }
  | { ok: false; error: string };

/**
 * Verify that `signature` over `message` really came from `address`.
 *
 * Returns a plain result rather than throwing, so routes can respond with one
 * generic failure — a caller should not learn WHY verification failed.
 */
export async function verifyWalletSignature(
  address: string,
  message: string,
  signature: string,
): Promise<VerifyResult> {
  const checksummed = normaliseAddress(address);
  if (!checksummed) return { ok: false, error: 'Not a valid Ethereum address.' };
  if (typeof signature !== 'string' || !signature.startsWith('0x')) {
    return { ok: false, error: 'Missing or malformed signature.' };
  }

  try {
    const valid = await verifyMessage({
      address: checksummed as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return valid
      ? { ok: true, address: checksummed }
      : { ok: false, error: 'Signature does not match the address.' };
  } catch {
    return { ok: false, error: 'Signature could not be verified.' };
  }
}

/** True when the nonce has passed its expiry. */
export function nonceExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() < now.getTime();
}
