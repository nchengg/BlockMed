// Tests for resolving a deal's parties to on-chain addresses.
//
// The rule under test: a deal between two real accounts goes on-chain with
// THEIR addresses, or it does not go on-chain at all. Silently substituting a
// shared demo wallet would produce a deal that cannot be funded by the party
// who owns it, failing later with an unexplained revert.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const findMany = vi.fn();
const findUnique = vi.fn();
vi.mock('@/lib/db', () => ({ prisma: { account: { findMany: (a: unknown) => findMany(a), findUnique: (a: unknown) => findUnique(a) } } }));

const { resolvePartyAddresses, expectedSignerFor } = await import('./partyWallets');

const DEV = {
  chainId: 31337,
  rpcUrl: 'http://127.0.0.1:8545',
  usdc: '0xusdc',
  escrow: '0xescrow',
  accounts: { releaser: '0xrel', buyer: '0xdevbuyer', seller: '0xdevseller' },
} as never;

const WALLET_A = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
const WALLET_B = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

const deal = (buyerId?: string, sellerId?: string) => ({
  parties: {
    buyer: buyerId ? { accountId: buyerId, hat: 'buyer' } : undefined,
    seller: sellerId ? { accountId: sellerId, hat: 'seller' } : undefined,
  },
}) as never;

beforeEach(() => { findMany.mockReset(); findUnique.mockReset(); });

describe('resolvePartyAddresses', () => {
  it('uses both parties own linked wallets', async () => {
    findMany.mockResolvedValue([
      { id: 'b', companyName: 'Buyer Co', walletAddress: WALLET_A },
      { id: 's', companyName: 'Seller Co', walletAddress: WALLET_B },
    ]);
    const r = await resolvePartyAddresses(deal('b', 's'), DEV);
    expect(r).toEqual({ ok: true, addresses: { buyer: WALLET_A, seller: WALLET_B, real: true } });
  });

  // The important negative: no silent fallback to the shared wallet.
  it('refuses when the buyer has not linked', async () => {
    findMany.mockResolvedValue([
      { id: 'b', companyName: 'Buyer Co', walletAddress: null },
      { id: 's', companyName: 'Seller Co', walletAddress: WALLET_B },
    ]);
    const r = await resolvePartyAddresses(deal('b', 's'), DEV);
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('unreachable');
    expect(r.unlinked).toEqual(['buyer']);
    expect(r.error).toContain('Buyer Co');
  });

  it('refuses when the seller has not linked', async () => {
    findMany.mockResolvedValue([
      { id: 'b', companyName: 'Buyer Co', walletAddress: WALLET_A },
      { id: 's', companyName: 'Seller Co', walletAddress: null },
    ]);
    const r = await resolvePartyAddresses(deal('b', 's'), DEV);
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('unreachable');
    expect(r.unlinked).toEqual(['seller']);
  });

  it('names both when neither has linked', async () => {
    findMany.mockResolvedValue([
      { id: 'b', companyName: 'Buyer Co', walletAddress: null },
      { id: 's', companyName: 'Seller Co', walletAddress: null },
    ]);
    const r = await resolvePartyAddresses(deal('b', 's'), DEV);
    if (r.ok) throw new Error('unreachable');
    expect(r.unlinked).toEqual(['buyer', 'seller']);
    expect(r.error).toContain('Buyer Co');
    expect(r.error).toContain('Seller Co');
  });

  // Deals predating accounts (counterparty invited by name) keep working.
  it('falls back to demo wallets when a party is not a real account', async () => {
    const r = await resolvePartyAddresses(deal('b', undefined), DEV);
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('unreachable');
    expect(r.addresses.real).toBe(false);
    expect(r.addresses.buyer).toBe('0xdevbuyer');
    expect(findMany).not.toHaveBeenCalled();
  });
});

describe('expectedSignerFor', () => {
  it('returns the linked address for the role', async () => {
    findUnique.mockResolvedValue({ walletAddress: WALLET_A });
    expect(await expectedSignerFor(deal('b', 's'), 'buyer')).toBe(WALLET_A);
  });

  it('returns null when the party has no account', async () => {
    expect(await expectedSignerFor(deal(undefined, 's'), 'buyer')).toBeNull();
  });

  it('returns null when the account has no wallet', async () => {
    findUnique.mockResolvedValue({ walletAddress: null });
    expect(await expectedSignerFor(deal('b', 's'), 'buyer')).toBeNull();
  });
});
