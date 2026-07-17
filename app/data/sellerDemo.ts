// Static, synthetic demo data for the /seller flow's upload step.
// Deal-specific fields (deal ID, buyer, amount, terms) live in the shared
// deal store (lib/dealStore.tsx) so they stay consistent with /buyer and
// /dashboard. No backend, no real document verification — simulated state only.

export const sellerDemo = {
  acceptedFormats: ['pdf', 'png', 'jpg', 'jpeg'],
};

export const checkingSubLabels = [
  'Checking invoice total…',
  'Checking seller details…',
  'Checking deal reference…',
];
