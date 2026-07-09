// Static, presentational demo data for the /dashboard shell that isn't part
// of the shared deal state (lib/dealStore.tsx). Deal ID, amount, addresses,
// payment/document status, and audit trail all live in the shared store so
// they stay consistent with /buyer and /seller.

export type Role = 'buyer' | 'seller' | 'operator';

export type DocumentStatus = 'required_mvp' | 'coming_next';

export type DemoDocument = {
  id: string;
  name: string;
  status: DocumentStatus;
  extractedFields?: { label: string; value: string }[];
};

// Extracted fields shown for the commercial invoice once it's been uploaded.
// Upload/discrepancy state itself comes from the shared deal store.
export const demoDocuments: DemoDocument[] = [
  {
    id: 'commercial-invoice',
    name: 'Commercial invoice',
    status: 'required_mvp',
    extractedFields: [
      { label: 'Invoice number', value: 'INV-2026-0417' },
      { label: 'Invoice total', value: '$48,600.00' },
      { label: 'Escrow amount', value: '$48,250.00' },
      { label: 'Seller', value: 'Solaris Textiles Co.' },
      { label: 'Buyer', value: 'Meridian Imports Ltd.' },
      { label: 'Invoice date', value: '2026-06-30' },
    ],
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

export const demoSettings = {
  releaseRule: 'Funds release automatically when the uploaded invoice matches the deal terms: invoice total, seller details, and deal reference.',
  disputeWindow: '5 days after document check result',
  visibility: 'Shared read-only link enabled — participants see full detail, others see status only.',
};
