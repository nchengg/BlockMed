'use client';
// DAN'S DASHBOARD — a parallel, independent surface.
//
// Why it exists: the main dashboard (components/dashboard/*) grew the escrow flow
// on top of a pre-seeded mock deal store, so "propose terms" happens INSIDE a deal
// that already exists and there is no way to start a genuinely new deal (BRD FR-1).
// This surface rebuilds the journey in the order the product actually works —
// create a deal first, everything else follows — without touching Nick's dashboard.
//
// It reuses the SAME backend: app/api/escrow/* → lib/escrow/* → the local chain.
// No new contract, no new lifecycle logic; only a different front door.
//
// Right now: deliberately empty. The flow gets built here step by step.
import Link from 'next/link';

export default function DanDashboard() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
      {/* Top bar — deliberately minimal; this surface has no nav yet. */}
      <header
        style={{
          borderBottom: '1px solid var(--border, #27272A)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.01em' }}
        >
          Blockmediary
        </Link>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: 4,
            padding: '3px 8px',
          }}
        >
          DAN&apos;S DASHBOARD
        </span>
        <Link
          href="/"
          style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          Back to site
        </Link>
      </header>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '56px 24px 120px' }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          Empty dashboard
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 560, marginBottom: 40 }}>
          A clean surface, built in the order the deal actually happens. Nothing here yet —
          the flow gets added step by step, starting with creating a deal.
        </p>

        {/* Placeholder for the first real step. Intentionally inert. */}
        <div
          style={{
            border: '1px dashed var(--border, #27272A)',
            borderRadius: 10,
            padding: '48px 32px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            No deals yet.
          </p>
        </div>
      </div>
    </main>
  );
}
