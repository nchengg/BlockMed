'use client';

import { Suspense } from 'react';
import { FunctionalDashboardShell } from '@/components/dashboard/FunctionalDashboardShell';

export default function IntegratedDashboardPage() {
  return (
    <Suspense fallback={null}>
      <FunctionalDashboardShell />
    </Suspense>
  );
}
