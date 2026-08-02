'use client';
// Session context for every page under /dan, so the dashboard and the deal
// pages share one session lookup rather than each wrapping themselves.
import { SessionProvider } from '@/lib/auth/useSession';

export default function DanLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
