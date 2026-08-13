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

/**
 * Send a transaction from the user's wallet and return its hash.
 *
 * The server never sees a key: it supplies `to` and `data`, and the wallet
 * turns that into a signed transaction only if the user approves. Gas is left
 * to the wallet to estimate — MetaMask does this better than we can, and a bad
 * hardcoded limit is a common cause of mysterious failures.
 */
export async function sendTransaction(
  from: string,
  to: string,
  data: string,
  gas?: string,
): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No browser wallet found.');
  // Pass an explicit gas limit when the server estimated one. MetaMask's own
  // estimator has returned values thousands of times too high on Base —
  // above the chain's per-transaction cap, so the node refuses the signed
  // transaction. Gas is charged on what is USED, so an explicit limit never
  // costs more; it only stops the wallet asking for an impossible amount.
  return (await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to, data, ...(gas ? { gas } : {}) }],
  })) as string;
}

/**
 * Wait for a transaction to be mined, via the wallet's own RPC connection.
 *
 * Needed between approve and deposit: eth_sendTransaction resolves as soon as
 * the transaction is BROADCAST, not when it is mined. Sending the deposit on
 * that signal races the approval, and the deposit reverts for want of an
 * allowance that is still pending.
 */
export async function waitForReceipt(hash: string, timeoutMs = 60_000): Promise<{ status: string }> {
  const provider = getProvider();
  if (!provider) throw new Error('No browser wallet found.');
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const receipt = (await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [hash],
    })) as { status?: string } | null;
    if (receipt) {
      if (receipt.status === '0x0') throw new Error('The transaction failed on-chain.');
      return { status: 'success' };
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Timed out waiting for the transaction to confirm.');
}

/**
 * Ask the wallet to switch networks, adding it first if unknown.
 *
 * 4902 is the EIP-1193 code for "this chain is not in the wallet" — the only
 * case where adding is appropriate. Anything else is a real error.
 */
export async function ensureChain(chainId: number, rpcUrl: string, name: string): Promise<void> {
  const provider = getProvider();
  if (!provider) throw new Error('No browser wallet found.');
  const hexId = `0x${chainId.toString(16)}`;
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexId }] });
  } catch (err) {
    if ((err as { code?: number })?.code !== 4902) throw err;
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: hexId,
        chainName: name,
        rpcUrls: [rpcUrl],
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      }],
    });
  }
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
