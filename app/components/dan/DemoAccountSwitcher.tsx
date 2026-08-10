'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/useSession';
import type { TradingCompany } from '@/lib/escrow/client';

export function DemoAccountSwitcher({ compact = false }: { compact?: boolean }) {
  const { account, refresh } = useSession();
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<TradingCompany[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentCompany = companies.find(company => company.accountId === account?.id);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/escrow/companies?demo=1', { cache: 'no-store' });
        const json = (await response.json().catch(() => ({}))) as {
          companies?: TradingCompany[];
        };
        if (!cancelled) setCompanies(json.companies ?? []);
      } catch {
        if (!cancelled) setCompanies([]);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [account?.id]);

  const switchAccount = async (accountId: string) => {
    setBusyId(accountId);
    setError(null);
    const response = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    });
    const json = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!response.ok || json.ok === false) {
      setError(json.error ?? 'Could not switch company.');
    } else {
      await refresh();
      setOpen(false);
    }
    setBusyId(null);
  };

  return (
    <div className={compact ? 'bm-demo-accounts bm-demo-accounts-compact' : 'bm-demo-accounts'}>
      {!compact && <div className="bm-kicker">Company access</div>}
      <button
        type="button"
        className="bm-demo-switch-trigger"
        aria-expanded={open}
        onClick={() => setOpen(next => !next)}
      >
        <span>
          <strong>{currentCompany?.displayName ?? account?.companyName ?? 'Choose demo company'}</strong>
          <small>{compact ? 'Switch company' : currentCompany?.displayName ?? account?.companyName ?? 'Demo sign-in'}</small>
        </span>
        <span className="bm-demo-switch-arrow">{open ? 'v' : '>'}</span>
      </button>

      {open && (
        <div className="bm-demo-account-list">
          {companies.map(company => {
            const active = account?.id === company.accountId;
            return (
              <button
                key={company.accountId}
                type="button"
                className="bm-demo-account"
                data-active={active}
                disabled={busyId !== null}
                onClick={() => { void switchAccount(company.accountId); }}
              >
                <span>
                  <strong>{company.displayName}</strong>
                  <small>{company.accountId === account?.id ? 'Current workspace' : 'Open this workspace'}</small>
                </span>
                <span className={active ? 'bm-status bm-status-success' : 'bm-status'}>
                  {active ? 'Current' : busyId === company.accountId ? 'Opening' : 'Open'}
                </span>
              </button>
            );
          })}
          {companies.length === 0 && <p className="bm-body">No demo companies found.</p>}
        </div>
      )}
      {error && <div className="bm-alert" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}
