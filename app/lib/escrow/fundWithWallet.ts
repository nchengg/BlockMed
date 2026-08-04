'use client';
// Funding a deal from the buyer's own wallet.
//
// Three phases, and the split matters:
//   1. ask the server WHAT to sign (it authorises, and builds the calldata)
//   2. the wallet signs and broadcasts   ← the only step holding a private key
//   3. tell the server what happened, which it verifies against the chain
//
// The server never holds the buyer's key, and never takes the client's word for
// the outcome — step 3 re-reads the receipt and the deal state before writing
// anything to the audit trail.
import {
  getChainId, ensureChain, requestAddress, sendTransaction, waitForReceipt, walletErrorMessage,
} from '@/lib/wallet/browser';

export type FundStep = { kind: 'approve' | 'deposit'; to: string; data: string; label: string };

export type FundProgress = {
  /** Which step is in flight, so the UI can say what the wallet is asking for. */
  step: FundStep;
  index: number;
  total: number;
};

export type FundOutcome =
  | { ok: true; approveHash?: string; depositHash: string }
  | { ok: false; error: string };

export async function fundWithWallet(
  dealId: string,
  onProgress?: (p: FundProgress) => void,
): Promise<FundOutcome> {
  // 1. What needs signing? The server authorises and builds the calldata.
  const prepRes = await fetch('/api/escrow/fund/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dealId }),
  });
  const prep = await prepRes.json();
  if (!prepRes.ok) return { ok: false, error: prep.error ?? 'Could not prepare the deposit.' };

  const steps: FundStep[] = prep.steps;

  try {
    // The connected account must be the one recorded on the deal. Signing from
    // a different account would be rejected by the contract with a bare revert,
    // so check here where we can explain it.
    const connected = await requestAddress();
    if (connected.toLowerCase() !== String(prep.from).toLowerCase()) {
      return {
        ok: false,
        error:
          `Your wallet is on ${connected.slice(0, 10)}…, but this deal is bound to ` +
          `${String(prep.from).slice(0, 10)}…. Switch account in MetaMask, then try again.`,
      };
    }

    // A transaction sent to the wrong chain is silently meaningless, so make
    // sure the wallet is pointed at the chain the escrow lives on.
    const chainId = await getChainId();
    if (chainId !== prep.chainId) {
      await ensureChain(prep.chainId, 'http://127.0.0.1:8545', 'Hardhat Local');
    }

    // 2. Sign each step in order. approve must confirm before deposit is sent,
    // or the deposit hits the token with no allowance and reverts.
    const hashes: Partial<Record<FundStep['kind'], string>> = {};
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      onProgress?.({ step, index: i, total: steps.length });
      const hash = await sendTransaction(prep.from, step.to, step.data);
      hashes[step.kind] = hash;
      // Wait for it to be mined before the next step: the deposit depends on
      // the approval already being on-chain.
      await waitForReceipt(hash);
    }

    // 3. Report back. The server verifies against the chain before recording.
    const confirmRes = await fetch('/api/escrow/fund/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealId, approveHash: hashes.approve, depositHash: hashes.deposit }),
    });
    const confirm = await confirmRes.json();
    if (!confirmRes.ok) return { ok: false, error: confirm.error ?? 'Deposit could not be confirmed.' };

    return { ok: true, approveHash: hashes.approve, depositHash: hashes.deposit! };
  } catch (err) {
    return { ok: false, error: walletErrorMessage(err) };
  }
}
