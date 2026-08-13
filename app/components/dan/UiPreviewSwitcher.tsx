'use client';

import { useSession, type UiPreviewRole } from '@/lib/auth/useSession';

const roles: Array<{ role: UiPreviewRole; label: string; detail: string }> = [
  { role: 'buyer', label: 'Buyer', detail: 'Meridian Imports' },
  { role: 'seller', label: 'Seller', detail: 'Ege Weave' },
  { role: 'platform', label: 'Platform', detail: 'Blockmediary Operations' },
];

/** Development-only browser-local role picker. It has no server-side authority. */
export function UiPreviewSwitcher({ compact = false }: { compact?: boolean }) {
  const { canUseUiPreview, isUiPreview, uiPreviewRole, startUiPreview, clearUiPreview } = useSession();
  if (!canUseUiPreview) return null;

  if (compact && isUiPreview) {
    return (
      <div className="bm-preview-compact">
        <span className="bm-status bm-status-info">Local preview: {uiPreviewRole}</span>
        {roles.map(({ role, label }) => (
          <button key={role} type="button" className="bm-button" disabled={role === uiPreviewRole} onClick={() => startUiPreview(role)}>
            {label}
          </button>
        ))}
        <button type="button" className="bm-button" onClick={() => { void clearUiPreview(); }}>Reset</button>
      </div>
    );
  }

  return (
    <section className="bm-card bm-preview-access" aria-label="Development UI preview">
      <div className="bm-kicker">Development only</div>
      <h2 className="bm-section-title" style={{ marginTop: 8 }}>Local UI preview</h2>
      <p className="bm-body" style={{ marginTop: 8 }}>
        Browse synthetic buyer, seller, and platform workspaces. This is stored only in this browser and does not create an account or call the database.
      </p>
      <div className="bm-actions" style={{ marginTop: 14 }}>
        {roles.map(({ role, label, detail }) => (
          <button key={role} type="button" className="bm-button" onClick={() => startUiPreview(role)}>
            {label} <span className="bm-muted">— {detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
