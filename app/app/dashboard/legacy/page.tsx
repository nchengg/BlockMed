import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { RequireParty } from '@/components/auth/RequireParty';
import { SessionBar } from '@/components/auth/SessionBar';

export default function LegacyDashboardPage() {
  return (
    <RequireParty allow={['client']}>
      <SessionBar />
      <DashboardShell />
    </RequireParty>
  );
}
