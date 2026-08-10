'use client';

import { DealDetailPage } from '@/app/dan/deals/[dealId]/page';

export default function DashboardDealPage({ params }: { params: Promise<{ dealId: string }> }) {
  return <DealDetailPage params={params} surface="dashboard" />;
}
