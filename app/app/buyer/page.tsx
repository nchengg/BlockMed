import { BuyerFlowShell } from '@/components/buyer/BuyerFlowShell';
import { RequireParty } from '@/components/auth/RequireParty';

// Client-only view. Admin / developer parties are redirected to their own portal.
export default function BuyerPage() {
  return (
    <RequireParty allow={['client']}>
      <BuyerFlowShell />
    </RequireParty>
  );
}
