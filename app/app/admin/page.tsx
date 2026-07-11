import { RequireParty } from '@/components/auth/RequireParty';
import { SessionBar } from '@/components/auth/SessionBar';
import { AdminPortal } from '@/components/admin/AdminPortal';

// Admin portal — operator side only. Client / developer parties are redirected.
export default function AdminPage() {
  return (
    <RequireParty allow={['admin']}>
      <SessionBar />
      <AdminPortal />
    </RequireParty>
  );
}
