'use client';
// DEVELOPER — the full technical / debug console. Unlike the curated Admin
// console, this exposes EVERYTHING: every state transition button, raw deal +
// session + registry state, wallet toggles and testing tools. developer ⊃ admin:
// it contains every admin verdict PLUS the low-level controls admin deliberately
// hides. This is the everything/debug view.
//
// PRODUCT NOTE: the DEVELOPER party is an instructor-requested addition and is
// NOT in the current BRD/TRD role model (buyer / seller / platform / admin).
// Flagged for team confirmation before it's treated as a settled role.

import { useDeal } from '@/lib/dealStore';
import { useAuth } from '@/lib/authStore';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

const CONTRACT_STATES = ['Created', 'Funded', 'DocsSubmitted', 'Checking', 'Released', 'Refunded', 'Cancelled'] as const;

function currentContractState(paymentStatus: string, documentStatus: string): string {
  if (paymentStatus === 'payment_released') return 'Released';
  if (paymentStatus === 'refunded') return 'Refunded';
  if (documentStatus === 'checking' || paymentStatus === 'checking_documents') return 'Checking';
  if (documentStatus === 'received') return 'DocsSubmitted';
  if (paymentStatus === 'funds_locked') return 'Funded';
  return 'Created';
}

export function DeveloperView() {
  const {
    deal, lockFunds, startUpload, markUploadFailed, markReceived,
    startDocumentCheck, resolveVerification, resetDocumentForReupload, resetDemo,
  } = useDeal();
  const { account, accounts, activeHat, connectWallet, disconnectWallet } = useAuth();
  const active = currentContractState(deal.paymentStatus, deal.documentStatus);

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 64px' }}>
      <header style={{ marginBottom: 12 }}>
        <EyebrowLabel>Developer · full debug console</EyebrowLabel>
        <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em' }}>Deal internals</h1>
      </header>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', border: '1px dashed var(--accent-border)', background: 'var(--accent-dim)', borderRadius: 8, padding: '10px 14px', marginBottom: 24 }}>
        <strong style={{ color: 'var(--accent)' }}>Product note:</strong> the Developer role is a new
        addition (instructor request) and is not yet in the BRD/TRD role model — pending team confirmation.
        This console is the full-control counterpart to the curated Admin console.
      </div>

      {/* Every state transition — the "all buttons" testing surface. */}
      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>State controls (drives shared deal store)</EyebrowLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <DebugButton label="lockFunds()" onClick={() => lockFunds(deal.amount)} />
          <DebugButton label="startUpload()" onClick={startUpload} />
          <DebugButton label="markUploadFailed()" onClick={markUploadFailed} />
          <DebugButton label="markReceived()" onClick={markReceived} />
          <DebugButton label="startDocumentCheck()" onClick={startDocumentCheck} />
          <DebugButton label="resolve: verified" onClick={() => resolveVerification('verified')} />
          <DebugButton label="resolve: failed" onClick={() => resolveVerification('failed')} />
          <DebugButton label="resolve: manual_review" onClick={() => resolveVerification('manual_review')} />
          <DebugButton label="resetDocumentForReupload()" onClick={resetDocumentForReupload} />
          <DebugButton label="resetDemo()" danger onClick={resetDemo} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          These call the deal store directly — no guards. Includes every admin verdict plus raw transitions.
        </p>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Escrow contract state (read-only mirror)</EyebrowLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {CONTRACT_STATES.map(s => {
            const on = s === active;
            return (
              <span
                key={s}
                className="mono"
                style={{
                  fontSize: 12, padding: '5px 10px', borderRadius: 6,
                  border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                  background: on ? 'var(--accent-dim)' : 'transparent',
                  color: on ? 'var(--accent)' : 'var(--text-muted)', fontWeight: on ? 700 : 500,
                }}
              >
                {s}
              </span>
            );
          })}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
          Mirrors the on-chain enum. No RPC calls — TODO(integration: on-chain).
        </p>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Session &amp; wallet (current account)</EyebrowLabel>
        <pre className="mono" style={preStyle}>
          {JSON.stringify(
            account
              ? { id: account.id, email: account.email, type: account.type, hats: account.hats, activeHat, wallet: account.wallet }
              : null,
            null, 2
          )}
        </pre>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <DebugButton label="connectWallet()" onClick={() => connectWallet()} />
          <DebugButton label="disconnectWallet()" onClick={disconnectWallet} />
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Account registry ({accounts.length}) — mock user DB</EyebrowLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {accounts.map(a => (
            <div key={a.id} className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-primary)' }}>{a.email}</span>
              <span style={{ color: 'var(--accent)' }}>[{a.type}{a.hats.length ? `:${a.hats.join('+')}` : ''}]</span>
              <span style={{ color: 'var(--text-muted)' }}>{a.wallet ? `${a.wallet.address.slice(0, 10)}…` : 'no-wallet'}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Deal object (shared store)</EyebrowLabel>
        <pre className="mono" style={preStyle}>
          {JSON.stringify(
            {
              dealId: deal.dealId, dealReference: deal.dealReference, network: deal.network,
              currency: deal.currency, amount: deal.amount, paymentStatus: deal.paymentStatus,
              documentStatus: deal.documentStatus, buyer: deal.buyer.address,
              seller: deal.seller.address, operator: deal.operator.address,
            },
            null, 2
          )}
        </pre>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Event log</EyebrowLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {deal.auditTrail.map((e, i) => (
            <div key={i} className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)' }}>{e.timestamp}</span>
              <span style={{ color: 'var(--accent)' }}>[{e.actor}]</span>
              <span>{e.event}</span>
              {e.txId && <span style={{ color: 'var(--text-muted)' }}>{e.txId}</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <EyebrowLabel>Integration seams</EyebrowLabel>
        <ul style={{ marginTop: 8, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: auth Q18)</span> — real auth (SIWE vs JWT vs both; wallet-less platform role). Currently mock account login.</li>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: wallet, TR-6.3)</span> — real wallet connect + ownership proof. Currently a stub address.</li>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: on-chain)</span> — wire escrow reads/writes to <span className="mono">contracts/</span>. No RPC/wallet here.</li>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: data)</span> — per-account deal scoping (single shared demo deal today).</li>
        </ul>
      </Card>
    </main>
  );
}

const preStyle: React.CSSProperties = {
  marginTop: 8, fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)',
  background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 8,
  padding: 14, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
};

function DebugButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mono"
      style={{
        background: 'var(--bg-mid)',
        color: danger ? 'var(--error)' : 'var(--text-secondary)',
        border: `1px solid ${danger ? 'var(--error-border)' : 'var(--border)'}`,
        borderRadius: 6, padding: '7px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
