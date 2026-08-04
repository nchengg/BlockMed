// Static, synthetic demo data for the /buyer flow's wallet step.
// Deal-specific fields (deal ID, seller, amount, terms) live in the shared
// deal store (lib/dealStore.tsx) so they stay consistent with /seller and
// /dashboard. No backend, no wallet, no real transactions — simulated state only.

export const buyerDemo = {
  buyerBalance: 62480.35,
};

export type WalletId = 'metamask' | 'coinbase' | 'walletconnect';

export const walletOptions: { id: WalletId; name: string }[] = [
  { id: 'metamask', name: 'MetaMask' },
  { id: 'coinbase', name: 'Coinbase Wallet' },
  { id: 'walletconnect', name: 'WalletConnect' },
];
