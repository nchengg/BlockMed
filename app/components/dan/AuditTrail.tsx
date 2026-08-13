'use client';

import type { AuditEntry } from '@/lib/escrow/store';

const EXPLORER_TX: Record<number, string> = {
  84532: 'https://sepolia.basescan.org/tx/',
  8453: 'https://basescan.org/tx/',
  11155111: 'https://sepolia.etherscan.io/tx/',
};

const EXPLORER_ADDRESS: Record<number, string> = {
  84532: 'https://sepolia.basescan.org/address/',
  8453: 'https://basescan.org/address/',
  11155111: 'https://sepolia.etherscan.io/address/',
};

/** Explorer URL for a transaction, or undefined off-chain / on a local chain. */
export function explorerTxUrl(chainId: number | undefined, txHash: string | null | undefined): string | undefined {
  if (!chainId || !txHash) return undefined;
  const base = EXPLORER_TX[chainId];
  return base ? `${base}${txHash}` : undefined;
}

/** Explorer URL for an address (e.g. the escrow contract). */
export function explorerAddressUrl(chainId: number | undefined, address: string | null | undefined): string | undefined {
  if (!chainId || !address) return undefined;
  const base = EXPLORER_ADDRESS[chainId];
  return base ? `${base}${address}` : undefined;
}

const ACTOR_CLASS: Record<string, string> = {
  buyer: 'bm-status bm-status-info',
  seller: 'bm-status bm-status-info',
  platform: 'bm-status',
  anyone: 'bm-status',
};

export function AuditTrail({ audit, chainId }: { audit: AuditEntry[]; chainId?: number }) {
  if (!audit?.length) {
    return (
      <div>
        <div className="bm-kicker" style={{ marginBottom: 10 }}>Audit trail</div>
        <p className="bm-body">No recorded actions yet.</p>
      </div>
    );
  }

  const explorer = chainId ? EXPLORER_TX[chainId] : undefined;

  return (
    <div>
      <div className="bm-kicker" style={{ marginBottom: 8 }}>Audit trail</div>
      <p className="bm-body" style={{ marginBottom: 16 }}>
        Every action on this deal, in order. Entries with a transaction hash are recorded on-chain.
      </p>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
        {audit.map((entry, index) => (
          <li key={`${entry.ts}-${index}`} style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className={ACTOR_CLASS[entry.actor] ?? 'bm-status'}>{entry.actor}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>
                {entry.action}
              </span>
              <span className="bm-muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
                {formatTs(entry.ts)}
              </span>
            </div>

            {entry.detail && <div className="bm-body">{entry.detail}</div>}

            {entry.txHash && (
              <div>
                {explorer ? (
                  <a
                    href={`${explorer}${entry.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bm-link bm-mono"
                    style={{ fontSize: 12, wordBreak: 'break-all' }}
                  >
                    {shortHash(entry.txHash)}
                  </a>
                ) : (
                  <span className="bm-mono bm-muted" title={entry.txHash} style={{ fontSize: 12, wordBreak: 'break-all' }}>
                    tx {shortHash(entry.txHash)}
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function shortHash(hash: string): string {
  return hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;
}

function formatTs(ts: string): string {
  const date = new Date(ts);
  return Number.isNaN(date.getTime())
    ? ts
    : date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
}
