'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MOCK auth store — DEMO ONLY, NOT REAL AUTHENTICATION.
//
// Model: ACCOUNT-FIRST, WALLET-SECOND.
//   • The ACCOUNT is the source of truth for identity and role. A user registers
//     an account and logs into it. The account carries the role (admin /
//     developer / client) and, for clients, which "hats" it may wear
//     (buyer / seller / platform).
//   • The WALLET is a SECONDARY, OPTIONAL attribute linked to an account AFTER
//     login. An account with no wallet still works (e.g. a platform /
//     intermediary party may never link one). Wallet-linking is a distinct
//     action inside the logged-in account — see components/account/AccountPanel.
//
// This store does NOT:
//   • store or verify any password
//   • talk to any identity provider / backend
//   • prove wallet ownership (the "connect" is faked)
// Registration + login are mock and marked as such throughout the UI.
//
// TODO(integration: auth Q18) — REAL AUTH SLOTS IN HERE.
//   Production auth is an OPEN team decision (TRD Q18: SIWE vs JWT vs both) and
//   must cover a wallet-less platform role. When settled, replace `login()` /
//   `register()` with the real flow and derive `account` from the verified
//   identity. Wallet linking is TR-6.3 (TODO(integration: wallet)). The rest of
//   the app only reads `useAuth()`, so downstream code shouldn't need to change.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Role lives on the account (source of truth). Coarse group used for routing.
export type AccountType = 'admin' | 'developer' | 'client';
export type PartyGroup = AccountType;

// Client sub-roles ("hats"). A client account may wear more than one — notably
// BOTH buyer and seller (the dual-hat exception) — and switch between them.
export type ClientHat = 'buyer' | 'seller' | 'platform';

// Wallet is optional and linked after login. `null` = not linked (still valid).
export type WalletLink = { address: string; connectedAt: string } | null;

export type Account = {
  id: string;
  email: string;
  displayName: string;
  type: AccountType;
  hats: ClientHat[]; // client sub-roles this account may wear; [] for admin/dev
  wallet: WalletLink;
};

export const typeLabel: Record<AccountType, string> = {
  admin: 'Administrator (staff)',
  developer: 'Developer',
  client: 'Client',
};

export const hatLabel: Record<ClientHat, string> = {
  buyer: 'Buyer (importer)',
  seller: 'Seller (exporter)',
  platform: 'Platform / intermediary',
};

// Where each account type lands after login. Clients land in the #26 dashboard
// (the logged-in portal); admin/developer get their own consoles.
export const groupHome: Record<AccountType, string> = {
  admin: '/admin',
  developer: '/dev',
  client: '/dashboard',
};

// Maps a client hat onto the existing dashboard "lens"
// (data/dashboardDemo.ts Role = 'buyer' | 'seller' | 'operator').
export function hatToLens(hat: ClientHat): 'buyer' | 'seller' | 'operator' {
  if (hat === 'seller') return 'seller';
  if (hat === 'platform') return 'operator';
  return 'buyer';
}

const ACCOUNTS_KEY = 'blockmediary-demo-accounts';
const SESSION_KEY = 'blockmediary-demo-session';

// Seeded demo accounts so graders can sign in as any party in one click, and to
// showcase the dual-hat (buyer+seller) and wallet-less (platform) cases. Buyer/
// seller wallets match the parties in the demo deal (lib/dealStore.tsx).
const SEED_ACCOUNTS: Account[] = [
  { id: 'acc-admin', email: 'admin@blockmediary.demo', displayName: 'Blockmediary Ops', type: 'admin', hats: [], wallet: null },
  { id: 'acc-dev', email: 'dev@blockmediary.demo', displayName: 'Blockmediary Dev', type: 'developer', hats: [], wallet: null },
  {
    id: 'acc-buyer', email: 'buyer@meridian.demo', displayName: 'Meridian Imports Ltd.',
    type: 'client', hats: ['buyer'],
    wallet: { address: '0x8f2a1c9d4e6b7a3f0512d8c9e4b6a7f2c9d1e841', connectedAt: '2026-07-08 10:02:14' },
  },
  {
    id: 'acc-seller', email: 'seller@solaris.demo', displayName: 'Solaris Textiles Co.',
    type: 'client', hats: ['seller'],
    wallet: { address: '0x3b91e0f2a8c7d4b6913e0a2f5c8d7b91e0f27ee0', connectedAt: '2026-07-08 11:20:41' },
  },
  {
    // Dual-hat client — acts as BOTH buyer and seller on the platform.
    id: 'acc-both', email: 'trader@bridgetrade.demo', displayName: 'BridgeTrade Co.',
    type: 'client', hats: ['buyer', 'seller'],
    wallet: { address: '0x77c4e2a9b81f6d3a05c2e9b4a7f1d8c6b3e0a291', connectedAt: '2026-07-08 14:55:09' },
  },
  {
    // Platform / intermediary — operates WITHOUT a wallet on purpose.
    id: 'acc-platform', email: 'ops@tradebridge.demo', displayName: 'TradeBridge Platform',
    type: 'client', hats: ['platform'], wallet: null,
  },
];

export const DEMO_LOGINS: { email: string; label: string }[] = [
  { email: 'admin@blockmediary.demo', label: 'Administrator' },
  { email: 'dev@blockmediary.demo', label: 'Developer' },
  { email: 'buyer@meridian.demo', label: 'Client · Buyer' },
  { email: 'seller@solaris.demo', label: 'Client · Seller' },
  { email: 'trader@bridgetrade.demo', label: 'Client · Buyer + Seller' },
  { email: 'ops@tradebridge.demo', label: 'Client · Platform (no wallet)' },
];

function nowStamp(): string {
  return new Date().toLocaleString(undefined, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).replace(',', '');
}

function fakeAddress(): string {
  const chars = '0123456789abcdef';
  const body = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `0x${body}`;
}

type Session = { accountId: string; activeHat: ClientHat | null };

export type RegisterInput = {
  email: string;
  displayName?: string;
  type: AccountType;
  hats?: ClientHat[];
};

type AuthResult = { ok: true; account: Account } | { ok: false; error: string };

type AuthContextValue = {
  hydrated: boolean;
  accounts: Account[]; // the mock registry (developer console can inspect it)
  account: Account | null; // current logged-in account — role source of truth
  // The account whose LENS the content is rendered through. Normally identical to
  // `account`; a developer using "view as" (dev-only impersonation) points this at
  // the previewed party while `account` stays the real developer session. Data
  // isolation (lib/dealStore) reads THIS, so previews respect the same scoping.
  // Impersonation is wired in a later step; for now viewerAccount === account.
  viewerAccount: Account | null;
  activeHat: ClientHat | null; // current client lens (buyer/seller/platform)
  group: PartyGroup | null;
  login: (email: string) => AuthResult; // MOCK — no password checked
  register: (input: RegisterInput) => AuthResult; // MOCK — creates an account
  logout: () => void;
  setActiveHat: (hat: ClientHat) => void; // dual-hat switching for clients
  connectWallet: (address?: string) => void; // secondary, optional
  disconnectWallet: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate registry + session from localStorage once on mount (client-only).
  useEffect(() => {
    try {
      const rawAccounts = window.localStorage.getItem(ACCOUNTS_KEY);
      if (rawAccounts) {
        const parsed = JSON.parse(rawAccounts) as Account[];
        if (Array.isArray(parsed) && parsed.length) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setAccounts(parsed);
        }
      }
      const rawSession = window.localStorage.getItem(SESSION_KEY);
      if (rawSession) {
        setSession(JSON.parse(rawSession) as Session);
      }
    } catch {
      // Corrupt/inaccessible storage — fall back to seed accounts, signed out.
    }
    setHydrated(true);
  }, []);

  // Persist registry + session on change, once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // Storage unavailable — state just won't survive a reload.
    }
  }, [accounts, session, hydrated]);

  const account = useMemo(
    () => (session ? accounts.find(a => a.id === session.accountId) ?? null : null),
    [accounts, session]
  );
  const activeHat = session?.activeHat ?? null;

  const login = useCallback((email: string): AuthResult => {
    // TODO(integration: auth Q18) — real auth verifies a credential/signature and
    // resolves the account server-side. Here we just look up a registered email.
    const found = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { ok: false, error: 'No account found for that email. Register, or use a quick login.' };
    setSession({ accountId: found.id, activeHat: found.hats[0] ?? null });
    return { ok: true, account: found };
  }, [accounts]);

  const register = useCallback((input: RegisterInput): AuthResult => {
    const email = input.email.trim().toLowerCase();
    if (!email) return { ok: false, error: 'Email is required.' };
    if (accounts.some(a => a.email.toLowerCase() === email)) {
      return { ok: false, error: 'An account with that email already exists — sign in instead.' };
    }
    const hats = input.type === 'client' ? (input.hats?.length ? input.hats : ['buyer'] as ClientHat[]) : [];
    const next: Account = {
      id: `acc-${Date.now().toString(36)}`,
      email,
      displayName: input.displayName?.trim() || email.split('@')[0],
      type: input.type,
      hats,
      wallet: null, // wallet linked later — account-first, wallet-second
    };
    setAccounts(prev => [...prev, next]);
    setSession({ accountId: next.id, activeHat: next.hats[0] ?? null });
    return { ok: true, account: next };
  }, [accounts]);

  const logout = useCallback(() => setSession(null), []);

  const setActiveHat = useCallback((hat: ClientHat) => {
    setSession(prev => {
      if (!prev) return prev;
      const acc = accounts.find(a => a.id === prev.accountId);
      if (!acc || !acc.hats.includes(hat)) return prev; // isolation: only own hats
      return { ...prev, activeHat: hat };
    });
  }, [accounts]);

  const connectWallet = useCallback((address?: string) => {
    // TODO(integration: wallet, TR-6.3) — real wallet connect (wagmi/SIWE) + link
    // proof to the account. This just attaches a fake address for the demo.
    if (!account) return;
    const addr = address?.trim() || fakeAddress();
    setAccounts(list => list.map(a =>
      a.id === account.id ? { ...a, wallet: { address: addr, connectedAt: nowStamp() } } : a
    ));
  }, [account]);

  const disconnectWallet = useCallback(() => {
    if (!account) return;
    setAccounts(list => list.map(a => (a.id === account.id ? { ...a, wallet: null } : a)));
  }, [account]);

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated, accounts, account, viewerAccount: account, activeHat, group: account?.type ?? null,
      login, register, logout, setActiveHat, connectWallet, disconnectWallet,
    }),
    [hydrated, accounts, account, activeHat, login, register, logout, setActiveHat, connectWallet, disconnectWallet]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
