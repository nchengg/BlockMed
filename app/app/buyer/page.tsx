import { BuyerFlowShell } from '@/components/buyer/BuyerFlowShell';
import { RequireParty } from '@/components/auth/RequireParty';

// Client-only view. Admin / developer parties are redirected to their own portal.
//
// TODO(follow-up: hat-level route gating) — this only gates to the CLIENT group,
// not to the buyer hat. A client account without a 'buyer' hat (e.g. seller-only)
// can still open this flow. Gate on account.hats.includes('buyer') and redirect
// hatless clients to their own context. Tracked as a known gap in the PR.
export default function BuyerPage() {
  return (
    <RequireParty allow={['client']}>
      <BuyerFlowShell />
    </RequireParty>
  );
}
