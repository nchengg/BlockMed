'use client';
// The deal's history (FR-14): who did what, when, and the on-chain proof.
//
// This is the regulator-facing artefact the whole product rests on — every
// decision recorded before the transaction that enacts it. Showing it is what
// makes the escrow auditable rather than merely automated.
//
// Transaction hashes link to a block explorer where one exists. On the local
// demo chain there is no explorer, so the hash is shown as copyable monospace
// text; the link appears automatically once this points at Base Sepolia.
import type { AuditEntry } from '@/lib/escrow/store';

// chainId → explorer transaction URL prefix. Local (31337) has none.
const EXPLORER_TX: Record<number, string> = {
  84532: 'https://sepolia.basescan.org/tx/',
  8453: 'https://basescan.org/tx/',
  11155111: 'https://sepolia.etherscan.io/tx/',
};

const ACTOR_TONE: Record<string, string> = {
  buyer: 'var(--accent)',
  seller: 'var(--accent)',
  platform: 'var(--text-secondary)',
  anyone: 'var(--text-secondary)',
};

export function AuditTrail({ audit, chainId }: { audit: AuditEntry[]; chainId?: number }) {
  if (!audit?.length) return null;
  const explorer = chainId ? EXPLORER_TX[chainId] : undefined;

  return (
    <div style={{ marginTop: 22 }}>
      <div className="section-label" style={{ fontSize: 10, marginBottom: 4 }}>
        AUDIT TRAIL
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 14px' }}>
        Every action on this deal, in order. Entries marked with a transaction hash were
        settled on-chain{explorer ? ' — click to view on the block explorer' : ''}.
      </p>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {audit.map((e, i) => {
          const last = i === audit.length - 1;
          return (
            <li key={`${e.ts}-${i}`} style={{ display: 'flex', gap: 12 }}>
              {/* Timeline rail */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 5,
                  background: e.txHash ? 'var(--accent)' : 'var(--text-muted)',
                }} />
                {!last && <span style={{ flex: 1, width: 1, background: 'var(--border)', marginTop: 3 }} />}
              </div>

              <div style={{ paddingBottom: last ? 0 : 16, minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: ACTOR_TONE[e.actor] ?? 'var(--text-secondary)',
                  }}>
                    {e.actor}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{e.action}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatTs(e.ts)}
                  </span>
                </div>

                {e.detail && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>
                    {e.detail}
                  </div>
                )}

                {e.txHash && (
                  <div style={{ marginTop: 5 }}>
                    {explorer ? (
                      <a
                        href={`${explorer}${e.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={ev => ev.stopPropagation()}
                        style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)', textDecoration: 'none', wordBreak: 'break-all' }}
                      >
                        {shortHash(e.txHash)} ↗
                      </a>
                    ) : (
                      <span
                        title={e.txHash}
                        style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}
                      >
                        tx {shortHash(e.txHash)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function shortHash(h: string): string {
  return h.length > 20 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h;
}

function formatTs(ts: string): string {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}
