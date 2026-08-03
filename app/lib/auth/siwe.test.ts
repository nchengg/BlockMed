// Tests for SIWE message building and signature verification.
//
// The security claim being tested is narrow but load-bearing: a signature is
// only accepted when it was produced by the private key for the claimed address
// over the exact message the server built. Everything else must be rejected.
import { describe, it, expect } from 'vitest';
import { privateKeyToAccount } from 'viem/accounts';
import {
  buildSiweMessage, normaliseAddress, verifyWalletSignature, nonceExpired, NONCE_TTL_MINUTES,
} from './siwe';

// Two throwaway keys — test vectors only, never used on any chain.
const KEY_A = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as const;
const KEY_B = '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba' as const;
const accountA = privateKeyToAccount(KEY_A);
const accountB = privateKeyToAccount(KEY_B);

const params = {
  domain: 'localhost:3000',
  address: accountA.address,
  nonce: 'abc123',
  issuedAt: '2026-08-03T12:00:00.000Z',
};

describe('buildSiweMessage', () => {
  it('includes the address, nonce and issuedAt', () => {
    const msg = buildSiweMessage(params);
    expect(msg).toContain(accountA.address);
    expect(msg).toContain('Nonce: abc123');
    expect(msg).toContain('Issued At: 2026-08-03T12:00:00.000Z');
  });

  it('states that no funds are moved, so the user knows what they are signing', () => {
    expect(buildSiweMessage(params).toLowerCase()).toContain('does not authorise any transaction');
  });

  it('is deterministic for the same inputs', () => {
    expect(buildSiweMessage(params)).toBe(buildSiweMessage(params));
  });

  it('changes when the nonce changes, so one signature cannot cover two challenges', () => {
    const a = buildSiweMessage(params);
    const b = buildSiweMessage({ ...params, nonce: 'different' });
    expect(a).not.toBe(b);
  });
});

describe('normaliseAddress', () => {
  it('checksums a lowercase address', () => {
    expect(normaliseAddress(accountA.address.toLowerCase())).toBe(accountA.address);
  });

  it('rejects junk, empty strings and short hex', () => {
    expect(normaliseAddress('not-an-address')).toBeNull();
    expect(normaliseAddress('')).toBeNull();
    expect(normaliseAddress('0x1234')).toBeNull();
  });
});

describe('verifyWalletSignature', () => {
  it('accepts a signature from the matching key', async () => {
    const message = buildSiweMessage(params);
    const signature = await accountA.signMessage({ message });
    const result = await verifyWalletSignature(accountA.address, message, signature);
    expect(result.ok).toBe(true);
  });

  it('accepts a lowercase address and returns it checksummed', async () => {
    const message = buildSiweMessage(params);
    const signature = await accountA.signMessage({ message });
    const result = await verifyWalletSignature(accountA.address.toLowerCase(), message, signature);
    expect(result).toEqual({ ok: true, address: accountA.address });
  });

  // The impersonation case: B signs, but claims to be A.
  it('rejects a valid signature from a DIFFERENT address', async () => {
    const message = buildSiweMessage(params);
    const signature = await accountB.signMessage({ message });
    const result = await verifyWalletSignature(accountA.address, message, signature);
    expect(result.ok).toBe(false);
  });

  // The replay case: a signature over an old nonce must not verify against a new one.
  it('rejects a signature made over a different message', async () => {
    const signed = buildSiweMessage(params);
    const signature = await accountA.signMessage({ message: signed });
    const other = buildSiweMessage({ ...params, nonce: 'a-fresh-nonce' });
    const result = await verifyWalletSignature(accountA.address, other, signature);
    expect(result.ok).toBe(false);
  });

  it('rejects malformed and empty signatures without throwing', async () => {
    const message = buildSiweMessage(params);
    for (const sig of ['', 'not-hex', '0xdeadbeef']) {
      const result = await verifyWalletSignature(accountA.address, message, sig);
      expect(result.ok).toBe(false);
    }
  });

  it('rejects an invalid address outright', async () => {
    const result = await verifyWalletSignature('0xnope', 'msg', '0x00');
    expect(result.ok).toBe(false);
  });
});

describe('nonceExpired', () => {
  const now = new Date('2026-08-03T12:00:00.000Z');

  it('is false while inside the window', () => {
    expect(nonceExpired(new Date(now.getTime() + 60_000), now)).toBe(false);
  });

  it('is true once past expiry', () => {
    expect(nonceExpired(new Date(now.getTime() - 1), now)).toBe(true);
  });

  it('uses a short TTL — a challenge should not sit open for long', () => {
    expect(NONCE_TTL_MINUTES).toBeLessThanOrEqual(15);
  });
});
