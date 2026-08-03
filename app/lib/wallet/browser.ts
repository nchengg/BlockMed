'use client';
// The browser wallet (EIP-1193 provider injected by MetaMask et al).
//
// Deliberately thin and dependency-free: we need exactly three things — the
// account, a personal_sign, and the chain. Pulling in a connector library
// (wagmi/Reown) buys WalletConnect and a modal we do not need for a local
// MetaMask demo, and would be a large surface to review before the deadline.
// If mobile wallets become a requirement, that is the point to reach for one.

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window { ethereum?: Eip1193Provider }
}

export function getProvider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function hasWallet(): boolean {
  return getProvider() !== null;
}

/**
 * Prompt the user to connect and return the selected address.
 *
 * `eth_requestAccounts` is the one that shows the popup; `eth_accounts` returns
 * only already-authorised accounts and is silent. We want the prompt here — the
 * user is explicitly asking to link.
 */
export async function requestAddress(): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No browser wallet found. Install MetaMask to link a wallet.');
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error('No account was returned by the wallet.');
  }
  return accounts[0];
}

/**
 * Ask the wallet to sign `message` with `address`.
 *
 * personal_sign takes params in [message, address] order — the reverse of
 * eth_sign — and the message is hex-encoded so wallets render it as UTF-8 text
 * rather than a hash. A user should be able to read what they are signing.
 */
export async function signMessage(address: string, message: string): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No browser wallet found.');
  const bytes = new TextEncoder().encode(message);
  const hex = `0x${Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')}`;
  const signature = (await provider.request({
    method: 'personal_sign',
    params: [hex, address],
  })) as string;
  return signature;
}

/** The chain the wallet is currently pointed at, as a decimal chain id. */
export async function getChainId(): Promise<number> {
  const provider = getProvider();
  if (!provider) throw new Error('No browser wallet found.');
  const hex = (await provider.request({ method: 'eth_chainId' })) as string;
  return Number.parseInt(hex, 16);
}

/**
 * Turn a wallet error into something worth showing a user.
 *
 * EIP-1193 defines 4001 as "user rejected" — by far the most common outcome,
 * and not an error worth alarming anyone about.
 */
export function walletErrorMessage(err: unknown): string {
  const e = err as { code?: number; message?: string };
  if (e?.code === 4001) return 'You rejected the request in your wallet.';
  return e?.message ?? 'Something went wrong talking to your wallet.';
}
