import { SellerFlowShell } from '@/components/seller/SellerFlowShell';
import { RequireParty } from '@/components/auth/RequireParty';

// Client-only view. Admin / developer parties are redirected to their own portal.
export default function SellerPage() {
  return (
    <RequireParty allow={['client']}>
      <SellerFlowShell />
    </RequireParty>
  );
}
