'use client';

import { Suspense } from 'react';
import { DashboardLoadingState, FunctionalDashboardShell } from '@/components/dashboard/FunctionalDashboardShell';

export default function IntegratedDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingState />}>
      <FunctionalDashboardShell />
    </Suspense>
  );
}
