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
import { hatLabel, typeLabel, useAuth, type Account } from '@/lib/authStore';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';
import { DealSwitcher } from '@/components/dashboard/DealSwitcher';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AdminPortal } from '@/components/admin/AdminPortal';

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
  const {
    account, accounts, activeHat, connectWallet, disconnectWallet,
    impersonating, impersonatedAccount, impersonate, stopImpersonating,
  } = useAuth();

  // VIEW-AS PREVIEW — when impersonating, the whole console is replaced by the
  // previewed party's own view, rendered through the same isolation + lens they'd
  // get. The dev's real session is untouched (SessionBar still shows developer),
  // and a persistent banner keeps the preview obvious and exitable.
  if (impersonating && impersonatedAccount) {
    return <ImpersonationPreview target={impersonatedAccount} onExit={stopImpersonating} />;
  }

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

      {/* Developer sees ALL deals — pick which one the controls below drive. */}
      <Card style={{ marginBottom: 20 }}>
        <DealSwitcher />
      </Card>

      {/* View-as preview — dev-only impersonation of any party's isolated view. */}
      <ViewAsControl accounts={accounts} selfId={account?.id ?? null} onView={impersonate} />


      {/* Every state transition — the "all buttons" testing surface. */}
      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>State controls (drives the selected deal)</EyebrowLabel>
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
        <EyebrowLabel>Deal object (selected deal)</EyebrowLabel>
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
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: data, TR-6.1/6.2)</span> — real per-account deal scoping. Isolation is mocked here (in-memory seeded deals filtered by viewer); wire to the real deal service, authorised server-side.</li>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: auth Q18)</span> — server-side gating for &ldquo;view as&rdquo; (who may impersonate whom + audit). Developer + view-as is a PRODUCT ADDITION, not in the current BRD/TRD role model — pending team confirmation.</li>
        </ul>
      </Card>
    </main>
  );
}

// ── View-as preview (dev-only impersonation) ──────────────────────────────────
// PRODUCT ADDITION — not in the current BRD/TRD role model. Lets a developer
// preview ANY party's dashboard exactly as that party would see it, INCLUDING
// their isolated data (reads flow through lib/dealStore's viewer filter). It is
// an explicit preview, never a real role change — see authStore.impersonate.
function ViewAsControl({
  accounts, selfId, onView,
}: {
  accounts: Account[];
  selfId: string | null;
  onView: (accountId: string) => void;
}) {
  return (
    <Card style={{ marginBottom: 20, borderColor: 'var(--accent-border)' }}>
      <EyebrowLabel>View as party — developer preview</EyebrowLabel>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, marginBottom: 12, lineHeight: 1.6 }}>
        Preview any party&apos;s view rendered as they&apos;d see it — with THEIR isolated deals. This is an
        impersonation <strong>preview</strong>, not a role change: your developer session stays intact and a
        banner keeps it obvious. <span className="mono" style={{ color: 'var(--text-muted)' }}>developer + view-as</span> is a
        product addition (not in BRD/TRD) — <span className="mono" style={{ color: 'var(--text-muted)' }}>TODO(integration: auth Q18)</span>.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {accounts.map(a => {
          const isSelf = a.id === selfId;
          const hats = a.hats.length ? a.hats.map(h => hatLabel[h].split(' ')[0]).join(' + ') : '—';
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onView(a.id)}
              style={{
                textAlign: 'left', cursor: 'pointer', background: 'var(--bg-mid)',
                border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {a.displayName}
                  {isSelf && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> · you</span>}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.email}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                  {typeLabel[a.type]}{a.type === 'client' ? ` · ${hats}` : ''}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 9px' }}>
                  View as →
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// The whole console is replaced by this while impersonating. A sticky, clearly
// marked banner sits above the previewed party's real view.
function ImpersonationPreview({ target, onExit }: { target: Account; onExit: () => void }) {
  const hats = target.hats.length ? target.hats.map(h => hatLabel[h].split(' ')[0]).join(' + ') : '';
  const roleText = `${typeLabel[target.type]}${target.type === 'client' && hats ? ` · ${hats}` : ''}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          padding: '10px 20px', background: 'var(--accent-dim)',
          borderBottom: '1px solid var(--accent-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)',
              border: '1px solid var(--accent-border)', borderRadius: 4, padding: '2px 6px',
            }}
          >
            DEVELOPER PREVIEW
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Viewing as{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{target.displayName}</span>
            <span style={{ color: 'var(--text-muted)' }}> · {roleText}</span>
            <span style={{ color: 'var(--text-muted)' }}> — showing their isolated data. Your developer session is unchanged.</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onExit}
          style={{
            background: 'var(--accent)', color: 'var(--bg-deep)', border: 'none', borderRadius: 6,
            padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Exit preview
        </button>
      </div>

      {/* key by target id so per-preview local state (e.g. dashboard hat) resets
          cleanly when switching between previewed parties. */}
      {target.type === 'client' && <DashboardShell key={target.id} />}
      {target.type === 'admin' && <AdminPortal key={target.id} />}
      {target.type === 'developer' && (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <Card>
            <EyebrowLabel>Nothing to preview</EyebrowLabel>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.7 }}>
              That&apos;s the developer console — the view you&apos;re already in. Exit the preview to use it.
            </p>
          </Card>
        </main>
      )}
    </div>
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
