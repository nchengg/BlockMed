import { RequireParty } from '@/components/auth/RequireParty';
import { SessionBar } from '@/components/auth/SessionBar';
import { DeveloperView } from '@/components/developer/DeveloperView';

// Developer view — developer party only. NOTE: this role is a product addition
// not yet in the BRD/TRD (see DeveloperView). Client / admin parties redirected.
export default function DevPage() {
  return (
    <RequireParty allow={['developer']}>
      <SessionBar />
      <DeveloperView />
    </RequireParty>
  );
}
