'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MOCK session / role context — DEMO ONLY, NOT REAL AUTHENTICATION.
//
// This is a pick-a-party scaffold so the front-end can SEPARATE views per party
// (admin ≠ developer ≠ client, and buyer ≠ seller within client). It stores a
// chosen role + a fake email in React context and localStorage. It does NOT:
//   • store or verify any password
//   • talk to any identity provider / backend
//   • prove wallet ownership
// Anyone can pick any role. That is fine for a demo of view separation.
//
// TODO(integration: auth Q18) — REAL AUTH SLOTS IN HERE.
//   The production auth mechanism is an OPEN team decision (TRD Q18: SIWE vs JWT
//   vs both) and must cover a wallet-less platform/intermediary role. When it is
//   settled, replace `login()` below with the real flow (challenge/verify, token
//   or SIWE session) and derive `session` from the verified identity instead of
//   from a client-side pick. The rest of the app only reads `useSession()`, so
//   nothing downstream should need to change.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// The full set of parties/views to separate (from BRD/TRD role model, plus the
// instructor-requested DEVELOPER view — see report / team-confirm flag).
//   admin      — operator side (Blockmediary staff)
//   developer  — internal/technical view  [PRODUCT ADDITION, not yet in BRD/TRD]
//   buyer      — client sub-role: importer
//   seller     — client sub-role: exporter
//   platform   — client sub-role: platform / intermediary (wallet-less)
export type PartyRole = 'admin' | 'developer' | 'buyer' | 'seller' | 'platform';

// Coarse grouping used for route separation: each group gets its own portal.
export type PartyGroup = 'admin' | 'developer' | 'client';

export const partyGroup: Record<PartyRole, PartyGroup> = {
  admin: 'admin',
  developer: 'developer',
  buyer: 'client',
  seller: 'client',
  platform: 'client',
};

export const roleLabel: Record<PartyRole, string> = {
  admin: 'Administrator',
  developer: 'Developer',
  buyer: 'Buyer (importer)',
  seller: 'Seller (exporter)',
  platform: 'Platform / intermediary',
};

// Where each party lands after signing in. Buyer/seller reuse the linear flows
// #26 already built; platform lands on the shared deal dashboard (operator lens).
export const roleHome: Record<PartyRole, string> = {
  admin: '/admin',
  developer: '/dev',
  buyer: '/buyer',
  seller: '/seller',
  platform: '/dashboard',
};

// Maps a session role onto the existing dashboard "lens" (data/dashboardDemo.ts
// Role = 'buyer' | 'seller' | 'operator'). The platform/intermediary sees the
// operator lens. Lets the shared dashboard read the session — "same system,
// different lens".
export function dashboardLensForRole(role: PartyRole): 'buyer' | 'seller' | 'operator' {
  if (role === 'seller') return 'seller';
  if (role === 'platform' || role === 'admin') return 'operator';
  return 'buyer';
}

export type Session = {
  role: PartyRole;
  // Fake, unverified identifier the user typed at the mock login. Display only.
  email: string;
};

const STORAGE_KEY = 'blockmediary-demo-session';

type SessionContextValue = {
  session: Session | null;
  hydrated: boolean;
  // MOCK sign-in — records the picked role. No credential is checked.
  login: (role: PartyRole, email?: string) => Session;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (client-only, avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Session;
        if (parsed && parsed.role in partyGroup) {
          // One-time sync from an external store (localStorage) on mount.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSession(parsed);
        }
      }
    } catch {
      // Corrupt or inaccessible storage — treat as signed-out silently.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable — session just won't survive a reload.
    }
  }, [session, hydrated]);

  const login = useCallback((role: PartyRole, email?: string) => {
    // TODO(integration: auth Q18) — real auth would verify a credential / signature
    // here and derive the role from the verified identity, not from the caller.
    const next: Session = {
      role,
      email: email?.trim() || `${role}@demo.blockmediary`,
    };
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, hydrated, login, logout }),
    [session, hydrated, login, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
