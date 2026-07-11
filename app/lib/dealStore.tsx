'use client';
// Shared, frontend-only demo deal state used across /buyer, /seller, /dashboard,
// /admin and /dev. No backend — persisted to localStorage so state survives full
// page reloads, and held in React context so client-side navigation between
// routes sees the same live values immediately.
//
// PER-ACCOUNT DATA ISOLATION (this file's job):
//   The store now holds MANY deals, each OWNED by parties (a buyer account, a
//   seller account and an operator account, referenced by account id). Selectors
//   filter the deal set by the current VIEWER (lib/authStore → viewerAccount):
//     • a client sees only deals where it is the buyer, seller or operator;
//     • admin / developer see ALL deals (oversight);
//   so one client never sees another client's unrelated deals, while a deal
//   SHARED between a buyer and a seller shows up in BOTH their dashboards — the
//   "same system, two lenses" idea.
//
//   The viewer comes from authStore, so a developer using "view as" (dev-only
//   impersonation) reads deals THROUGH this same isolation as the previewed
//   party — no special-casing here.
//
// TODO(integration: data, TR-6.1/6.2) — real per-account deal scoping is a data
//   API concern. Replace SEED_DEALS + the in-memory list with reads/writes to the
//   real deal service, authorised server-side by the verified identity. The rest
//   of the app only reads useDeal()/its selectors, so downstream code shouldn't
//   need to change.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/authStore';

// Mirrors StatusTone from components/dashboard/ui.tsx — kept as a plain
// string union here so this shared-state module doesn't import from the UI
// layer. Structurally compatible wherever a StatusTone is expected.
type StatusTone = 'accent' | 'success' | 'error' | 'pending';

export type PaymentStatus =
  | 'awaiting_deposit'
  | 'funds_locked'
  | 'checking_documents'
  | 'payment_released'
  | 'refunded';

export type DocumentStatus =
  | 'not_uploaded'
  | 'uploading'
  | 'received'
  | 'checking'
  | 'verified'
  | 'failed'
  | 'manual_review';

export const documentStatusLabel: Record<DocumentStatus, string> = {
  not_uploaded: 'Waiting for upload',
  uploading: 'Uploading',
  received: 'Document received',
  checking: 'Checking deal terms',
  verified: 'Verified',
  failed: 'Discrepancy found',
  manual_review: 'Manual review',
};

export type VerificationOutcome = 'verified' | 'failed' | 'manual_review';

export type AuditEntry = {
  timestamp: string;
  event: string;
  actor: 'Buyer' | 'Seller' | 'Blockmediary' | 'System';
  txId?: string;
};

export type DealState = {
  dealId: string;
  dealReference: string;
  network: string;
  currency: string;
  amount: number;
  createdDate: string;
  // Party OWNERSHIP — which seeded account plays each role on this deal. These
  // ids drive isolation (see visibleDealsFor). The businessName/address are the
  // human-facing display, kept in sync with the seeded accounts (authStore).
  buyerAccountId: string | null;
  sellerAccountId: string | null;
  operatorAccountId: string | null;
  buyer: { businessName: string; address: string };
  seller: { businessName: string; address: string };
  operator: { businessName: string; address: string };
  requiredDocument: string;
  paymentStatus: PaymentStatus;
  documentStatus: DocumentStatus;
  discrepancyReason?: string;
  auditTrail: AuditEntry[];
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  awaiting_deposit: 'Awaiting deposit',
  funds_locked: 'Funds locked',
  checking_documents: 'Checking documents',
  payment_released: 'Payment released',
  refunded: 'Refunded',
};

export const paymentStatusTone: Record<PaymentStatus, StatusTone> = {
  awaiting_deposit: 'pending',
  funds_locked: 'accent',
  checking_documents: 'accent',
  payment_released: 'success',
  refunded: 'error',
};

const STORAGE_KEY = 'blockmediary-demo-deals';

// ── Party display, kept consistent with the seeded accounts in authStore ──────
// Referenced by account id so isolation and display never drift apart.
const PARTIES = {
  meridian: { accountId: 'acc-buyer', businessName: 'Meridian Imports Ltd.', address: '0x8f2a1c9d4e6b7a3f0512d8c9e4b6a7f2c9d1e841' },
  solaris: { accountId: 'acc-seller', businessName: 'Solaris Textiles Co.', address: '0x3b91e0f2a8c7d4b6913e0a2f5c8d7b91e0f27ee0' },
  bridge: { accountId: 'acc-both', businessName: 'BridgeTrade Co.', address: '0x77c4e2a9b81f6d3a05c2e9b4a7f1d8c6b3e0a291' },
  platform: { accountId: 'acc-platform', businessName: 'TradeBridge Platform (operator)', address: '0x0000000000000000000000000000000000E5C50W' },
} as const;

function party(p: { accountId: string; businessName: string; address: string }) {
  return { businessName: p.businessName, address: p.address };
}

// Seeded multi-deal set. Overlaps are deliberate so isolation is demonstrable:
//   • Meridian (buyer-only)  sees A, B
//   • Solaris  (seller-only) sees B, C
//   • BridgeTrade (dual-hat) sees A (as seller) and C (as buyer)
//   • TradeBridge Platform (operator) sees A, B, C
//   • admin / developer see everything
// Deal B is SHARED between Meridian and Solaris — the same deal, two lenses.
export const SEED_DEALS: DealState[] = [
  {
    // A — Meridian ⇄ BridgeTrade, still awaiting the buyer's deposit.
    dealId: 'DEAL-1B0C-9A42',
    dealReference: 'INV-2026-0402',
    network: 'Ethereum Sepolia',
    currency: 'USDC',
    amount: 31200,
    createdDate: '2026-07-07',
    buyerAccountId: PARTIES.meridian.accountId,
    sellerAccountId: PARTIES.bridge.accountId,
    operatorAccountId: PARTIES.platform.accountId,
    buyer: party(PARTIES.meridian),
    seller: party(PARTIES.bridge),
    operator: party(PARTIES.platform),
    requiredDocument: 'Commercial invoice',
    paymentStatus: 'awaiting_deposit',
    documentStatus: 'not_uploaded',
    auditTrail: [
      { timestamp: '2026-07-07 08:31:10', event: 'Escrow created', actor: 'System', txId: '0x9c1f...02ab' },
      { timestamp: '2026-07-07 08:44:52', event: 'Deal terms confirmed by both parties', actor: 'System' },
    ],
  },
  {
    // B — Meridian ⇄ Solaris, mid-flight: funded, invoice in, being checked.
    // SHARED deal — appears in both Meridian's and Solaris's dashboards.
    dealId: 'DEAL-7F3A-2C19',
    dealReference: 'INV-2026-0417',
    network: 'Ethereum Sepolia',
    currency: 'USDC',
    amount: 48250,
    createdDate: '2026-07-09',
    buyerAccountId: PARTIES.meridian.accountId,
    sellerAccountId: PARTIES.solaris.accountId,
    operatorAccountId: PARTIES.platform.accountId,
    buyer: party(PARTIES.meridian),
    seller: party(PARTIES.solaris),
    operator: party(PARTIES.platform),
    requiredDocument: 'Commercial invoice',
    paymentStatus: 'checking_documents',
    documentStatus: 'received',
    auditTrail: [
      { timestamp: '2026-07-09 09:14:02', event: 'Escrow created', actor: 'System', txId: '0x1a2b...44f0' },
      { timestamp: '2026-07-09 09:22:47', event: 'Deal terms confirmed by both parties', actor: 'System' },
      { timestamp: '2026-07-09 10:05:31', event: 'Funds locked in escrow', actor: 'Buyer', txId: '0x5d7e...9931' },
      { timestamp: '2026-07-09 14:12:08', event: 'Commercial invoice uploaded', actor: 'Seller' },
    ],
  },
  {
    // C — BridgeTrade (as buyer) ⇄ Solaris, already settled.
    dealId: 'DEAL-4E88-0D57',
    dealReference: 'INV-2026-0355',
    network: 'Ethereum Sepolia',
    currency: 'USDC',
    amount: 22750,
    createdDate: '2026-07-02',
    buyerAccountId: PARTIES.bridge.accountId,
    sellerAccountId: PARTIES.solaris.accountId,
    operatorAccountId: PARTIES.platform.accountId,
    buyer: party(PARTIES.bridge),
    seller: party(PARTIES.solaris),
    operator: party(PARTIES.platform),
    requiredDocument: 'Commercial invoice',
    paymentStatus: 'payment_released',
    documentStatus: 'verified',
    auditTrail: [
      { timestamp: '2026-07-02 11:02:41', event: 'Escrow created', actor: 'System', txId: '0x33aa...c1d2' },
      { timestamp: '2026-07-02 11:20:15', event: 'Deal terms confirmed by both parties', actor: 'System' },
      { timestamp: '2026-07-03 09:41:55', event: 'Funds locked in escrow', actor: 'Buyer', txId: '0x7b0c...ee45' },
      { timestamp: '2026-07-04 15:33:20', event: 'Commercial invoice uploaded', actor: 'Seller' },
      { timestamp: '2026-07-04 15:39:02', event: 'Document check result: verified', actor: 'Blockmediary' },
      { timestamp: '2026-07-04 15:39:07', event: 'Payment released', actor: 'System', txId: '0x88fd...1a0e' },
    ],
  },
];

// Neutral placeholder returned as the "active deal" when the viewer has NO
// visible deals (e.g. a freshly-registered client). Never falls back to another
// account's deal — that would break isolation. Its id is not in the store, so
// mutators targeting it are no-ops.
export const EMPTY_DEAL: DealState = {
  dealId: '—',
  dealReference: '—',
  network: 'Ethereum Sepolia',
  currency: 'USDC',
  amount: 0,
  createdDate: '—',
  buyerAccountId: null,
  sellerAccountId: null,
  operatorAccountId: null,
  buyer: { businessName: '—', address: '—' },
  seller: { businessName: '—', address: '—' },
  operator: { businessName: '—', address: '—' },
  requiredDocument: 'Commercial invoice',
  paymentStatus: 'awaiting_deposit',
  documentStatus: 'not_uploaded',
  auditTrail: [],
};

// The DEFAULT/first seeded deal, kept as a named export for any code that wants
// a representative deal without a viewer (e.g. server-rendered fallbacks).
export const DEFAULT_DEAL: DealState = SEED_DEALS[1]; // the shared, mid-flight deal

// Isolation predicate — which deals a given viewer may see.
export function visibleDealsFor(
  deals: DealState[],
  viewer: { id: string; type: 'admin' | 'developer' | 'client' } | null,
): DealState[] {
  if (!viewer) return [];
  if (viewer.type === 'admin' || viewer.type === 'developer') return deals; // full oversight
  // client — only deals where this account is a party (buyer / seller / operator)
  return deals.filter(
    d =>
      d.buyerAccountId === viewer.id ||
      d.sellerAccountId === viewer.id ||
      d.operatorAccountId === viewer.id,
  );
}

function fakeTxId(): string {
  const chars = '0123456789abcdef';
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `0x${part(4)}...${part(4)}`;
}

function nowStamp(): string {
  return new Date().toLocaleString(undefined, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).replace(',', '');
}

type DealContextValue = {
  // Isolation-aware selectors (new)
  deals: DealState[]; // ALL deals in the store (raw; admin/dev-oriented)
  visibleDeals: DealState[]; // deals the current viewer is allowed to see
  activeDealId: string; // id of the deal the mutators/`deal` point at
  selectDeal: (id: string) => void; // pick which visible deal is active
  // Backward-compatible single-deal surface — always the ACTIVE, visible deal.
  deal: DealState;
  hydrated: boolean;
  // Mutators — all operate on the active deal, by id.
  lockFunds: (amount: number) => void;
  startUpload: () => void;
  markUploadFailed: () => void;
  markReceived: () => void;
  startDocumentCheck: () => void;
  resolveVerification: (outcome: VerificationOutcome, reason?: string) => void;
  resetDocumentForReupload: () => void;
  resetDemo: () => void;
};

const DealContext = createContext<DealContextValue | null>(null);

export function DealProvider({ children }: { children: React.ReactNode }) {
  // The VIEWER drives isolation. viewerAccount is the real account normally, or
  // the impersonated account when a developer is using "view as" (authStore).
  const { viewerAccount } = useAuth();

  const [deals, setDeals] = useState<DealState[]>(SEED_DEALS);
  const [activeDealId, setActiveDealId] = useState<string>(DEFAULT_DEAL.dealId);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (client-only, avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DealState[];
        if (Array.isArray(parsed) && parsed.length) {
          // One-time sync from an external store (localStorage) on mount —
          // exactly the case useEffect is for; can't read localStorage during render.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDeals(parsed);
        }
      }
    } catch {
      // Corrupt or inaccessible storage — fall back to SEED_DEALS silently.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated (avoids overwriting saved state
  // with the seeds before hydration has run).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
    } catch {
      // Storage unavailable (private browsing, quota) — demo state just
      // won't persist across reloads; still works for the current session.
    }
  }, [deals, hydrated]);

  const visibleDeals = useMemo(
    () => visibleDealsFor(deals, viewerAccount ? { id: viewerAccount.id, type: viewerAccount.type } : null),
    [deals, viewerAccount],
  );

  // The active deal must be one the viewer can see. If the current selection
  // isn't visible (e.g. the viewer just changed, or a dev switched "view as"),
  // fall back to the viewer's first visible deal — never to a deal they can't
  // see, so isolation holds even for the `deal` convenience field.
  const activeDeal = useMemo(() => {
    return (
      visibleDeals.find(d => d.dealId === activeDealId) ??
      visibleDeals[0] ??
      EMPTY_DEAL
    );
  }, [visibleDeals, activeDealId]);

  const selectDeal = useCallback((id: string) => setActiveDealId(id), []);

  // Apply an update to the ACTIVE deal by id. If the active deal is the empty
  // placeholder (no visible deals), this is a no-op — nothing to mutate.
  const updateActive = useCallback((updater: (d: DealState) => DealState) => {
    const targetId = activeDeal.dealId;
    if (targetId === EMPTY_DEAL.dealId) return;
    setDeals(list => list.map(d => (d.dealId === targetId ? updater(d) : d)));
  }, [activeDeal.dealId]);

  const lockFunds = useCallback((amount: number) => {
    updateActive(prev => ({
      ...prev,
      amount,
      paymentStatus: 'funds_locked',
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Funds locked in escrow', actor: 'Buyer', txId: fakeTxId() },
      ],
    }));
  }, [updateActive]);

  const startUpload = useCallback(() => {
    updateActive(prev => ({
      ...prev,
      documentStatus: 'uploading',
      discrepancyReason: undefined,
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Uploading commercial invoice (simulated)…', actor: 'Seller' },
      ],
    }));
  }, [updateActive]);

  const markUploadFailed = useCallback(() => {
    updateActive(prev => ({
      ...prev,
      documentStatus: 'not_uploaded',
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Upload failed — retry requested (simulated network error)', actor: 'Seller' },
      ],
    }));
  }, [updateActive]);

  const markReceived = useCallback(() => {
    updateActive(prev => ({
      ...prev,
      documentStatus: 'received',
      paymentStatus: 'checking_documents',
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Commercial invoice uploaded', actor: 'Seller' },
      ],
    }));
  }, [updateActive]);

  const startDocumentCheck = useCallback(() => {
    updateActive(prev => ({
      ...prev,
      documentStatus: 'checking',
      paymentStatus: 'checking_documents',
      discrepancyReason: undefined,
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Document check started (simulated — no real AI verification)', actor: 'Blockmediary' },
        { timestamp: nowStamp(), event: 'Checking invoice total…', actor: 'Blockmediary' },
        { timestamp: nowStamp(), event: 'Checking seller details…', actor: 'Blockmediary' },
        { timestamp: nowStamp(), event: 'Checking deal reference…', actor: 'Blockmediary' },
      ],
    }));
  }, [updateActive]);

  const resolveVerification = useCallback((outcome: VerificationOutcome, reason?: string) => {
    updateActive(prev => {
      if (outcome === 'verified') {
        return {
          ...prev,
          documentStatus: 'verified',
          paymentStatus: 'payment_released',
          discrepancyReason: undefined,
          auditTrail: [
            ...prev.auditTrail,
            { timestamp: nowStamp(), event: 'Document check result: verified', actor: 'Blockmediary' },
            { timestamp: nowStamp(), event: 'Payment released', actor: 'System', txId: fakeTxId() },
          ],
        };
      }
      if (outcome === 'failed') {
        return {
          ...prev,
          documentStatus: 'failed',
          discrepancyReason: reason ?? "Invoice amount doesn't match escrow amount.",
          auditTrail: [
            ...prev.auditTrail,
            { timestamp: nowStamp(), event: 'Document check result: discrepancy detected', actor: 'Blockmediary' },
          ],
        };
      }
      return {
        ...prev,
        documentStatus: 'manual_review',
        auditTrail: [
          ...prev.auditTrail,
          { timestamp: nowStamp(), event: 'Escalated to manual review', actor: 'Blockmediary' },
        ],
      };
    });
  }, [updateActive]);

  const resetDocumentForReupload = useCallback(() => {
    updateActive(prev => ({
      ...prev,
      documentStatus: 'not_uploaded',
      paymentStatus: prev.paymentStatus === 'checking_documents' ? 'funds_locked' : prev.paymentStatus,
      discrepancyReason: undefined,
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Re-upload requested', actor: 'Seller' },
      ],
    }));
  }, [updateActive]);

  // Reset the WHOLE store back to seeds (dev/testing tool).
  const resetDemo = useCallback(() => {
    setDeals(SEED_DEALS);
    setActiveDealId(DEFAULT_DEAL.dealId);
  }, []);

  const value = useMemo<DealContextValue>(
    () => ({
      deals, visibleDeals, activeDealId: activeDeal.dealId, selectDeal,
      deal: activeDeal, hydrated,
      lockFunds, startUpload, markUploadFailed, markReceived,
      startDocumentCheck, resolveVerification, resetDocumentForReupload, resetDemo,
    }),
    [deals, visibleDeals, activeDeal, selectDeal, hydrated,
      lockFunds, startUpload, markUploadFailed, markReceived,
      startDocumentCheck, resolveVerification, resetDocumentForReupload, resetDemo]
  );

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useDeal(): DealContextValue {
  const ctx = useContext(DealContext);
  if (!ctx) throw new Error('useDeal must be used within a DealProvider');
  return ctx;
}
