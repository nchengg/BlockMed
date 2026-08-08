'use client';

import { SessionProvider } from '@/lib/auth/useSession';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
