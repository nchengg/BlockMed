// Server-only chain access for the LOCAL DEMO. Signs with the standard Hardhat dev
// accounts (publicly known keys, worthless outside localhost:8545). This module must
// never be imported from a client component.
//
// Ported from the closed PR #25 (feat/escrow-web-ui), consuming the #24 Escrow
// contract now merged to main (contracts/contracts/Escrow.sol) — UNCHANGED. The ABI
// under ./abi is generated from that exact contract.
//
// TODO(integration: auth Q18) — the Base Sepolia / production path replaces this
// module with real party wallets (wagmi / SIWE) for buyer & seller, and a
// SERVER-HELD releaser key loaded from a secret (never a source file, never the
// public Hardhat keys below). The releaser signer here is a LOCAL DEMO ONLY
// convenience — see lib/escrow/actor.ts and app/api/escrow/submit-bol/route.ts.
import {
  createPublicClient,
  createWalletClient,
  http,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, hardhat } from "viem/chains";
import { readFileSync } from "node:fs";
import path from "node:path";
import EscrowArtifact from "./abi/Escrow.json";
import MockUSDCArtifact from "./abi/MockUSDC.json";

export const escrowAbi = EscrowArtifact.abi as Abi;
export const usdcAbi = MockUSDCArtifact.abi as Abi;

export type Role = "releaser" | "buyer" | "seller";

// Hardhat node default accounts #0–#2 (printed by `npx hardhat node`). These are
// the well-known, deterministic dev keys shipped with Hardhat — PUBLIC by design,
// zero value on any real network. They exist only so the local demo can sign
// without a wallet UI. NEVER put a real key here.
//
// They are also why the local demo must stay local: on a public chain these
// addresses are occupied by whatever anyone else has deployed to them, and any
// funds sent there are gone. On Base Sepolia the buyer and seller keys do not
// exist at all — real parties sign from their own linked wallets.
const DEV_KEYS: Record<Role, Hex> = {
  releaser: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  buyer: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  seller: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
};

export interface Deployment {
  chainId: number;
  rpcUrl: string;
  usdc: Address;
  escrow: Address;
  /** Present on the local demo only; a public deployment has no party keys. */
  accounts: { releaser: Address; buyer?: Address; seller?: Address };
  /** True when the escrow points at a real token we cannot mint. */
  realToken?: boolean;
}

/**
 * Which deployment to talk to.
 *
 * ESCROW_NETWORK selects the file: "local" (default) or "baseSepolia". Keeping
 * one file per network means both can coexist — switching is an env change, not
 * a redeploy, and the local demo keeps working untouched.
 */
export function networkName(): string {
  return process.env.ESCROW_NETWORK?.trim() || "local";
}

// Written by contracts/scripts/deploy-*.ts. process.cwd() is the Next app dir,
// so "../contracts/deployments/<net>.json" resolves to the repo-level contracts pkg.
export function loadDeployment(): Deployment {
  const net = networkName();
  const p = path.join(process.cwd(), "..", "contracts", "deployments", `${net}.json`);
  try {
    return JSON.parse(readFileSync(p, "utf8")) as Deployment;
  } catch {
    throw new Error(
      `No deployment found for network "${net}" (expected ${p}). ` +
        `Deploy it first, or set ESCROW_NETWORK to a network you have deployed.`,
    );
  }
}

/** Human names for the chains this app can be pointed at. */
export const CHAIN_LABELS: Record<number, string> = {
  31337: "Local Hardhat",
  84532: "Base Sepolia",
  8453: "Base Mainnet",
};

/** viem chain descriptor for a deployment, keyed by its chain id. */
function chainFor(dep: Deployment) {
  if (dep.chainId === baseSepolia.id) return baseSepolia;
  if (dep.chainId === hardhat.id) return hardhat;
  throw new Error(`Unsupported chainId ${dep.chainId}.`);
}

export function publicClient(dep: Deployment) {
  return createPublicClient({ chain: chainFor(dep), transport: http(dep.rpcUrl) });
}

/**
 * The signer for a platform role.
 *
 * On the local chain this is a public Hardhat key. Anywhere else the key comes
 * from the environment and is never in source — and the buyer/seller roles have
 * NO server-side key at all, because on a real network those transactions are
 * signed by the parties' own wallets. Asking for one is a bug, not a fallback.
 */
export function walletFor(role: Role, dep: Deployment) {
  const chain = chainFor(dep);

  if (dep.chainId !== hardhat.id) {
    if (role !== "releaser") {
      throw new Error(
        `No server-side key for the ${role} on ${networkName()} — that party signs ` +
          `from their own wallet. Only the releaser is server-signed.`,
      );
    }
    const key = process.env.RELEASER_PRIVATE_KEY?.trim();
    if (!key) {
      throw new Error(
        "RELEASER_PRIVATE_KEY is not set. The platform releaser key must be provided " +
          "via the environment on any network other than the local dev chain.",
      );
    }
    return createWalletClient({
      account: privateKeyToAccount(key as Hex),
      chain,
      transport: http(dep.rpcUrl),
    });
  }

  return createWalletClient({
    account: privateKeyToAccount(DEV_KEYS[role]),
    chain,
    transport: http(dep.rpcUrl),
  });
}

// Mirrors the on-chain State enum (contracts/contracts/Escrow.sol), including the
// Cancelled state added by #24's Q16 resolution.
export const STATE_NAMES = [
  "Draft",
  "Agreed",
  "Funded",
  "ReleasePending",
  "Released",
  "Refunded",
  "Cancelled",
] as const;
