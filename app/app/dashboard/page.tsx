import { Suspense } from 'react';
import { DashboardLoadingState, FunctionalDashboardShell } from '@/components/dashboard/FunctionalDashboardShell';

// Primary server-backed trade workspace. The former seeded dashboard remains at
// /dashboard/legacy until this integrated surface has completed rollout.
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingState />}>
      <FunctionalDashboardShell />
    </Suspense>
  );
}
