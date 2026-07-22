// Static, presentational demo data for the /dashboard shell that isn't part
// of the shared deal state (lib/dealStore.tsx). Deal ID, amount, addresses,
// payment/document status, and audit trail all live in the shared store so
// they stay consistent with /buyer and /seller.

import type { DealState } from '@/lib/dealStore';

export type Role = 'buyer' | 'seller' | 'operator';

export type DocumentStatus = 'required_mvp' | 'coming_next';

export type DemoDocument = {
  id: string;
  name: string;
  status: DocumentStatus;
};

// The document CHECKLIST (names + which are MVP vs later) is static. The
// per-invoice "extracted fields" are NOT — they derive from the active deal
// (see invoiceFieldsFor), so the Documents tab always reflects whichever deal
// is in view rather than a single hardcoded one.
export const demoDocuments: DemoDocument[] = [
  {
    id: 'commercial-invoice',
    name: 'Commercial invoice',
    status: 'required_mvp',
  },
  {
    id: 'packing-list',
    name: 'Packing list',
    status: 'coming_next',
  },
  {
    id: 'transport-document',
    name: 'Transport document',
    status: 'coming_next',
  },
];

// Derives the commercial invoice's "extracted fields" from the ACTIVE deal so
// the Documents tab shows that deal's own parties and amounts — not a leftover
// hardcoded deal. Returns null when the active deal carries no meaningful data
// (the empty placeholder), so the tab can fall back to a neutral message
// instead of surfacing another deal's details.
export function invoiceFieldsFor(deal: DealState): { label: string; value: string }[] | null {
  const hasData = deal.dealReference !== '—' && deal.amount > 0;
  if (!hasData) return null;
  const money = `${deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${deal.currency}`;
  return [
    { label: 'Invoice number', value: deal.dealReference },
    { label: 'Invoice total', value: money },
    { label: 'Escrow amount', value: money },
    { label: 'Seller', value: deal.seller.businessName },
    { label: 'Buyer', value: deal.buyer.businessName },
    { label: 'Invoice date', value: deal.createdDate },
  ];
}

export const demoSettings = {
  releaseRule: 'Funds release automatically when the uploaded invoice matches the deal terms: invoice total, seller details, and deal reference.',
  disputeWindow: '5 days after document check result',
  visibility: 'Shared read-only link enabled — participants see full detail, others see status only.',
};
