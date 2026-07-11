import { SellerFlowShell } from '@/components/seller/SellerFlowShell';
import { RequireParty } from '@/components/auth/RequireParty';

// Client + SELLER-hat only. Admin / developer are redirected by the group gate;
// a client without the 'seller' hat (e.g. a buyer-only account) is bounced back
// to its own dashboard by the hat gate. The dual-hat account holds 'seller' and
// passes.
export default function SellerPage() {
  return (
    <RequireParty allow={['client']} requireHat="seller">
      <SellerFlowShell />
    </RequireParty>
  );
}
