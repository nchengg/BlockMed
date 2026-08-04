'use client';
// Shared low-level UI primitives for the dashboard - inline-styled, no component library.
import { useState } from 'react';

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type StatusTone = 'accent' | 'success' | 'error' | 'pending';

const toneVars: Record<StatusTone, { color: string; dim: string; border: string }> = {
  accent: { color: 'var(--accent)', dim: 'var(--accent-dim)', border: 'var(--accent-border)' },
  success: { color: 'var(--success)', dim: 'var(--success-dim)', border: 'var(--success-border)' },
  error: { color: 'var(--error)', dim: 'var(--error-dim)', border: 'var(--error-border)' },
  pending: { color: 'var(--pending)', dim: 'var(--pending-dim)', border: 'var(--pending-border)' },
};

export function StatusPill({ label, tone, dot = true }: { label: string; tone: StatusTone; dot?: boolean }) {
  const v = toneVars[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: v.color,
        background: v.dim,
        border: `1px solid ${v.border}`,
        borderRadius: 9999,
        padding: '4px 10px',
      }}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
      )}
      {label}
    </span>
  );
}

// Shortens a wallet/payment address to 0x1234...abcd. Non-standard values
// (e.g. the demo escrow placeholder) that are already short are shown as-is.
function truncateAddress(value: string): string {
  if (value.length <= 13 || value.includes('...')) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function AddressChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard unavailable (insecure context / permissions) - silently no-op;
      // the full address is still visible via the title tooltip.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Copied' : `${value} - click to copy`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'monospace',
        fontSize: 13,
        color: copied ? 'var(--success)' : 'var(--text-secondary)',
        background: 'var(--bg-mid)',
        border: `1px solid ${copied ? 'var(--success-border)' : 'var(--border)'}`,
        borderRadius: 6,
        padding: '4px 8px',
        cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s',
      }}
    >
      {copied ? 'Copied' : truncateAddress(value)}
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label" style={{ marginBottom: 12 }}>{children}</p>;
}
