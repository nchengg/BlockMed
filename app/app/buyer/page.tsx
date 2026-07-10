import { BuyerFlowShell } from '@/components/buyer/BuyerFlowShell';
import { RequireParty } from '@/components/auth/RequireParty';

// Client + BUYER-hat only. Admin / developer are redirected by the group gate;
// a client without the 'buyer' hat (e.g. a seller-only account) is bounced back
// to its own dashboard by the hat gate. The dual-hat account holds 'buyer' and
// passes.
export default function BuyerPage() {
  return (
    <RequireParty allow={['client']} requireHat="buyer">
      <BuyerFlowShell />
    </RequireParty>
  );
}
