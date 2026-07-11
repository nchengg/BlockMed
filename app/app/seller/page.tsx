import { SellerFlowShell } from '@/components/seller/SellerFlowShell';
import { RequireParty } from '@/components/auth/RequireParty';

// Client-only view. Admin / developer parties are redirected to their own portal.
//
// TODO(follow-up: hat-level route gating) — this only gates to the CLIENT group,
// not to the seller hat. A client account without a 'seller' hat (e.g. buyer-only)
// can still open this flow. Gate on account.hats.includes('seller') and redirect
// hatless clients to their own context. Tracked as a known gap in the PR.
export default function SellerPage() {
  return (
    <RequireParty allow={['client']}>
      <SellerFlowShell />
    </RequireParty>
  );
}
