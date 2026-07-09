import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { RequireParty } from '@/components/auth/RequireParty';
import { SessionBar } from '@/components/auth/SessionBar';

// Shared deal dashboard — client group (buyer / seller / platform). The in-page
// lens defaults to the signed-in party (see DashboardShell).
export default function DashboardPage() {
  return (
    <RequireParty allow={['client']}>
      <SessionBar />
      <DashboardShell />
    </RequireParty>
  );
}
