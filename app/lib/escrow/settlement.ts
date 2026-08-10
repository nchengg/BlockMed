// Server-only: the single place the platform's releaser key signs recordVerdict.
// Extracted from the submit-bol route so approve-release / finalise-release share
// one guarded path. The local-chain guard travels with it: the dev key may only
// ever sign against the local Hardhat chain (TODO integration: auth Q18).
import { NextResponse } from "next/server";
import { publicClient, walletFor, escrowAbi, type Deployment } from "./chain";

// Gate on whether a releaser key is properly configured, not on which chain we
// are on.
//
// This replaces an earlier chainId === 31337 check. That check existed because
// the only releaser key was the PUBLIC Hardhat one compiled into the source, and
// signing with it anywhere real would hand control of every deal to anyone who
// read the repo. The guard was protecting against the key, not against the
// network — so the correct rule is "refuse unless the key came from the
// environment", which is what this does.
//
// The local chain keeps its dev-key convenience. Any other network requires
// RELEASER_PRIVATE_KEY, and must not be the well-known Hardhat key.
const HARDHAT_RELEASER_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export function assertLocalReleaser(dep: Deployment): NextResponse | null {
  if (dep.chainId === 31337) {
    // Local dev chain: the public key is fine, but never in a production build.
    if (process.env.NODE_ENV === "production") {
      return deny("Releaser signing with the public dev key is disabled in production builds.");
    }
    return null;
  }

  // Mainnet is deliberately refused, and this is the one place a chain id is
  // still checked on purpose. The blocker is not connectivity — chainFor() can
  // reach Base Mainnet — it is that the releaser key lives in an environment
  // variable, which is a hot wallet, not custody. docs/legal-risk.md §5.4.1
  // names this the platform's top security risk and requires an HSM or a
  // threshold/multisig scheme before real funds are at stake.
  if (dep.chainId === 8453) {
    return deny(
      "Releaser signing is disabled on Base Mainnet. The key is held in an " +
        "environment variable, which is not adequate custody for real funds — " +
        "move RELEASER_ROLE to a multisig or HSM first (legal-risk.md §5.4.1).",
    );
  }

  const key = process.env.RELEASER_PRIVATE_KEY?.trim();
  if (!key) {
    return deny(
      "RELEASER_PRIVATE_KEY is not set. A server-held releaser key must be supplied " +
        "via the environment before the platform can sign on this network.",
    );
  }
  if (key.toLowerCase() === HARDHAT_RELEASER_KEY) {
    return deny(
      "RELEASER_PRIVATE_KEY is the public Hardhat test key. Anyone can use it — " +
        "generate a fresh key before signing on a public network.",
    );
  }
  return null;
}

function deny(error: string): NextResponse {
  return NextResponse.json({ ok: false, error }, { status: 501 });
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
