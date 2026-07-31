import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAccount } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// The trading companies a deal can be addressed to — real registered accounts,
// so every counterparty you can pick is one that can actually sign in and act on
// the deal. That is what makes the two-sided flow testable.
//
// Deliberately no buyer/seller split: an account is neither. The role is chosen
// per deal at creation (lib/escrow/roles.ts).
//
// TODO(full product) — this returns every client account, which is fine at demo
// scale. A real directory needs search, pagination, and an invite path for a
// counterparty who is not on the platform yet (FR-1).
export async function GET() {
  // Exclude the caller — you cannot be your own counterparty.
  const me = await getSessionAccount();

  const companies = await prisma.account.findMany({
    where: { type: "client", ...(me ? { id: { not: me.id } } : {}) },
    select: { id: true, companyName: true, email: true },
    orderBy: { companyName: "asc" },
  });

  return NextResponse.json({
    ok: true,
    companies: companies.map((c) => ({
      accountId: c.id,
      displayName: c.companyName,
      email: c.email,
    })),
  });
}
