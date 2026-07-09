'use client';
// Shared, frontend-only demo deal state used across /buyer, /seller, and
// /dashboard. No backend — persisted to localStorage so the state survives
// full page loads/reloads, and held in React context so client-side
// navigation between routes sees the same live values immediately.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

const STORAGE_KEY = 'blockmediary-demo-deal';

// Fallback used both for the server-rendered pass and for any page loaded
// directly with no prior interaction — a plausible, already-agreed deal
// waiting on the buyer to fund it.
export const DEFAULT_DEAL: DealState = {
  dealId: 'DEAL-7F3A-2C19',
  dealReference: 'INV-2026-0417',
  network: 'Ethereum Sepolia',
  currency: 'USDC',
  amount: 48250,
  createdDate: '2026-07-09',
  buyer: { businessName: 'Meridian Imports Ltd.', address: '0x8f2a1c9d4e6b7a3f0512d8c9e4b6a7f2c9d1e841' },
  seller: { businessName: 'Solaris Textiles Co.', address: '0x3b91e0f2a8c7d4b6913e0a2f5c8d7b91e0f27ee0' },
  operator: { businessName: 'Blockmediary AI Verification', address: '0x0000...ESCROW' },
  requiredDocument: 'Commercial invoice',
  paymentStatus: 'awaiting_deposit',
  documentStatus: 'not_uploaded',
  auditTrail: [
    { timestamp: '2026-07-09 09:14:02', event: 'Escrow created', actor: 'System', txId: '0x1a2b...44f0' },
    { timestamp: '2026-07-09 09:22:47', event: 'Deal terms confirmed by both parties', actor: 'System' },
  ],
};

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
  deal: DealState;
  hydrated: boolean;
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
  const [deal, setDeal] = useState<DealState>(DEFAULT_DEAL);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (client-only, avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DealState;
        // One-time sync from an external store (localStorage) on mount —
        // exactly the case useEffect is for; can't read localStorage during render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDeal(parsed);
      }
    } catch {
      // Corrupt or inaccessible storage — fall back to DEFAULT_DEAL silently.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated (avoids overwriting saved state
  // with the default before hydration has run).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deal));
    } catch {
      // Storage unavailable (private browsing, quota) — demo state just
      // won't persist across reloads; still works for the current session.
    }
  }, [deal, hydrated]);

  const lockFunds = useCallback((amount: number) => {
    setDeal(prev => ({
      ...prev,
      amount,
      paymentStatus: 'funds_locked',
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Funds locked in escrow', actor: 'Buyer', txId: fakeTxId() },
      ],
    }));
  }, []);

  const startUpload = useCallback(() => {
    setDeal(prev => ({
      ...prev,
      documentStatus: 'uploading',
      discrepancyReason: undefined,
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Uploading commercial invoice (simulated)…', actor: 'Seller' },
      ],
    }));
  }, []);

  const markUploadFailed = useCallback(() => {
    setDeal(prev => ({
      ...prev,
      documentStatus: 'not_uploaded',
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Upload failed — retry requested (simulated network error)', actor: 'Seller' },
      ],
    }));
  }, []);

  const markReceived = useCallback(() => {
    setDeal(prev => ({
      ...prev,
      documentStatus: 'received',
      paymentStatus: 'checking_documents',
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Commercial invoice uploaded', actor: 'Seller' },
      ],
    }));
  }, []);

  const startDocumentCheck = useCallback(() => {
    setDeal(prev => ({
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
  }, []);

  const resolveVerification = useCallback((outcome: VerificationOutcome, reason?: string) => {
    setDeal(prev => {
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
  }, []);

  const resetDocumentForReupload = useCallback(() => {
    setDeal(prev => ({
      ...prev,
      documentStatus: 'not_uploaded',
      paymentStatus: prev.paymentStatus === 'checking_documents' ? 'funds_locked' : prev.paymentStatus,
      discrepancyReason: undefined,
      auditTrail: [
        ...prev.auditTrail,
        { timestamp: nowStamp(), event: 'Re-upload requested', actor: 'Seller' },
      ],
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setDeal(DEFAULT_DEAL);
  }, []);

  const value = useMemo(
    () => ({
      deal, hydrated, lockFunds, startUpload, markUploadFailed, markReceived,
      startDocumentCheck, resolveVerification, resetDocumentForReupload, resetDemo,
    }),
    [deal, hydrated, lockFunds, startUpload, markUploadFailed, markReceived,
      startDocumentCheck, resolveVerification, resetDocumentForReupload, resetDemo]
  );

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useDeal(): DealContextValue {
  const ctx = useContext(DealContext);
  if (!ctx) throw new Error('useDeal must be used within a DealProvider');
  return ctx;
}
