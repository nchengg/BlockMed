'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/auth/useSession';
import type { TradingCompany } from '@/lib/escrow/client';

export function DemoAccountSwitcher({ compact = false }: { compact?: boolean }) {
  const { account, refresh } = useSession();
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<TradingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentCompany = companies.find(company => company.accountId === account?.id);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/escrow/companies?includeSelf=1', { cache: 'no-store' });
      const json = (await response.json().catch(() => ({}))) as {
        companies?: TradingCompany[];
        error?: string;
      };
      if (!response.ok) throw new Error(json.error ?? 'Could not load demo companies.');
      setCompanies(json.companies ?? []);
    } catch (cause) {
      setCompanies([]);
      setError(cause instanceof Error ? cause.message : 'Could not load demo companies.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => { void loadCompanies(); }, 0);
    return () => clearTimeout(initial);
  }, [account?.id, loadCompanies]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event instanceof MouseEvent && !rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const switchAccount = async (accountId: string) => {
    setBusyId(accountId);
    setError(null);
    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const json = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || json.ok === false) throw new Error(json.error ?? 'Could not switch company.');
      await refresh();
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not switch company.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div ref={rootRef} className={compact ? 'bm-demo-accounts bm-demo-accounts-compact' : 'bm-demo-accounts'}>
      {!compact && <div className="bm-kicker">Company access</div>}
      <button
        type="button"
        className="bm-demo-switch-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(next => !next)}
      >
        <span>
          <strong>{currentCompany?.displayName ?? account?.companyName ?? 'Choose demo company'}</strong>
          <small>{compact ? 'Switch company' : currentCompany?.email ?? account?.email ?? 'Sign in without a password'}</small>
        </span>
        <span className="bm-demo-switch-arrow" data-open={open} aria-hidden="true" />
      </button>

      {open && (
        <div className="bm-demo-account-list" role="listbox" aria-label="Demo company workspaces">
          {loading && <p className="bm-body">Loading company workspaces...</p>}
          {compact && error && (
            <div className="bm-alert bm-demo-list-error" role="alert">
              <span>{error}</span>
              <button type="button" className="bm-link-button" onClick={() => { void loadCompanies(); }}>
                Try again
              </button>
            </div>
          )}
          {companies.map(company => {
            const active = account?.id === company.accountId;
            return (
              <button
                key={company.accountId}
                type="button"
                className="bm-demo-account"
                data-active={active}
                role="option"
                aria-selected={active}
                disabled={busyId !== null || active}
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
          {!loading && companies.length === 0 && !error && (
            <div className="bm-demo-empty">
              <p className="bm-body">No demo company workspaces are available yet.</p>
              <button type="button" className="bm-link-button" onClick={() => { void loadCompanies(); }}>
                Try again
              </button>
            </div>
          )}
        </div>
      )}
      {error && !compact && <div className="bm-alert bm-demo-switch-error" role="alert">{error}</div>}
    </div>
  );
}
