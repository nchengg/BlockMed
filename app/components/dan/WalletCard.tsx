'use client';
// Wallet linking (SIWE) for the signed-in company.
//
// The flow is three steps and the middle one is the point of the whole thing:
//   1. ask the wallet which address it holds
//   2. get a server-issued nonce, and have the wallet SIGN it
//   3. send the signature back; the server verifies it recovers to that address
//
// Step 2 is what makes this proof rather than a claim. Without a signature, this
// would just be a text box where a company types an address — including someone
// else's. The nonce makes the signature single-use so it cannot be replayed.
import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/useSession';
import { getChainId, hasWallet, requestAddress, signMessage, walletErrorMessage } from '@/lib/wallet/browser';

/** Chains we expect during the demo. Anything else is worth flagging early. */
const KNOWN_CHAINS: Record<number, string> = {
  31337: 'Local Hardhat',
  84532: 'Base Sepolia',
  8453: 'Base Mainnet',
};

function shortAddress(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function WalletCard() {
  const { account, refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletPresent, setWalletPresent] = useState(true);

  // Provider detection has to wait for the client — window.ethereum does not
  // exist during SSR, and assuming its absence would flash a misleading warning.
  useEffect(() => {
    setWalletPresent(hasWallet());
    if (hasWallet()) getChainId().then(setChainId).catch(() => setChainId(null));
  }, []);

  const link = useCallback(async () => {
    setBusy(true); setError(null); setNote(null);
    try {
      const address = await requestAddress();

      const nonceRes = await fetch('/api/auth/wallet/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const nonceJson = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceJson.error ?? 'Could not start wallet linking.');

      // Sign the server's message verbatim. The issuedAt goes back with the
      // signature so the server rebuilds the identical string to verify against.
      const issuedAt = nonceJson.message.match(/^Issued At: (.+)$/m)?.[1];
      const signature = await signMessage(address, nonceJson.message);

      const linkRes = await fetch('/api/auth/wallet/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, issuedAt }),
      });
      const linkJson = await linkRes.json();
      if (!linkRes.ok) throw new Error(linkJson.error ?? 'Could not verify that wallet.');

      await refresh();
      setNote('Wallet linked.');
    } catch (err) {
      setError(walletErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const unlink = useCallback(async () => {
    setBusy(true); setError(null); setNote(null);
    try {
      const r = await fetch('/api/auth/wallet/link', { method: 'DELETE' });
      if (!r.ok) throw new Error('Could not unlink that wallet.');
      await refresh();
      setNote('Wallet unlinked. Existing deals keep the address they were created with.');
    } catch (err) {
      setError(walletErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  if (!account) return null;

  const linked = account.walletAddress;
  const chainLabel = chainId === null ? null : (KNOWN_CHAINS[chainId] ?? `Chain ${chainId}`);

  const button: React.CSSProperties = {
    border: '1px solid var(--border)', borderRadius: 6, padding: '8px 14px',
    fontSize: 13, fontWeight: 600, cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.6 : 1, background: 'transparent', color: 'var(--accent)',
  };

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: 20,
    }}>
      <div className="section-label" style={{ marginBottom: 12 }}>WALLET</div>

      {linked ? (
        <>
          <div style={{ fontFamily: 'monospace', fontSize: 15, color: 'var(--text-primary)' }}>
            {shortAddress(linked)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, wordBreak: 'break-all' }}>
            {linked}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button onClick={() => { void link(); }} disabled={busy} style={button}>
              Link a different wallet
            </button>
            <button onClick={() => { void unlink(); }} disabled={busy} style={{ ...button, color: 'var(--text-secondary)' }}>
              Unlink
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            No wallet linked. Linking proves you control an address, so deposits and
            releases can be tied to your company on-chain.
          </div>
          {walletPresent ? (
            <button onClick={() => { void link(); }} disabled={busy} style={{ ...button, marginTop: 14 }}>
              {busy ? 'Check your wallet…' : 'Link wallet'}
            </button>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
              No browser wallet detected. Install MetaMask to link one.
            </div>
          )}
        </>
      )}

      {chainLabel && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
          Wallet network: {chainLabel}
        </div>
      )}
      {note && <div style={{ fontSize: 13, color: 'var(--accent)', marginTop: 10 }}>{note}</div>}
      {error && <div style={{ fontSize: 13, color: '#F87171', marginTop: 10 }}>{error}</div>}
    </div>
  );
}
