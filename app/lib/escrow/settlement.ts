// Server-only: the single place the platform's releaser key signs recordVerdict.
// Extracted from the submit-bol route so approve-release / finalise-release share
// one guarded path. The local-chain guard travels with it: the dev key may only
// ever sign against the local Hardhat chain (TODO integration: auth Q18).
import { NextResponse } from "next/server";
import { publicClient, walletFor, escrowAbi, type Deployment } from "./chain";

// Hard stop: the server-held releaser key may only sign against the local Hardhat
// dev chain (chainId 31337). On any other network, or in a production build, the
// caller returns 501 instead of signing — the real releaser path is TODO(auth Q18).
export function assertLocalReleaser(dep: Deployment): NextResponse | null {
  const isLocalChain = dep.chainId === 31337;
  const isProd = process.env.NODE_ENV === "production";
  if (isLocalChain && !isProd) return null;
  return NextResponse.json(
    {
      ok: false,
      error:
        "Releaser signing is disabled outside the local dev chain. Wire the trusted " +
        "operator + real releaser key first (TODO integration: auth Q18).",
    },
    { status: 501 },
  );
}

// Signs recordVerdict (Funded → ReleasePending) and waits for the receipt.
// Call assertLocalReleaser first; every gate (verdict, buyer approval or quiet
// window expiry, no standing objection) must already have passed — after this
// transaction, release is permissionless and unstoppable (AP-7).
export async function recordVerdictOnChain(dep: Deployment, onChainDealId: string): Promise<string> {
  const pc = publicClient(dep);
  const releaser = walletFor("releaser", dep);
  const hash = await releaser.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "recordVerdict",
    args: [onChainDealId],
  });
  await pc.waitForTransactionReceipt({ hash });
  return hash;
}
