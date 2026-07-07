// Server-only chain access for the LOCAL DEMO. Signs with the standard Hardhat dev
// accounts (publicly known keys, worthless outside localhost:8545). This module must
// never be imported from a client component. The Base Sepolia demo replaces this
// with real wallets (wagmi/RainbowKit) + a server-held releaser key.
import {
  createPublicClient,
  createWalletClient,
  http,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { readFileSync } from "node:fs";
import path from "node:path";
import EscrowArtifact from "./abi/Escrow.json";
import MockUSDCArtifact from "./abi/MockUSDC.json";

export const escrowAbi = EscrowArtifact.abi as Abi;
export const usdcAbi = MockUSDCArtifact.abi as Abi;

export type Role = "releaser" | "buyer" | "seller";

// Hardhat node default accounts #0–#2 (printed by `npx hardhat node`).
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
  accounts: { releaser: Address; buyer: Address; seller: Address };
}

export function loadDeployment(): Deployment {
  const p = path.join(process.cwd(), "..", "contracts", "deployments", "local.json");
  return JSON.parse(readFileSync(p, "utf8")) as Deployment;
}

export function publicClient(dep: Deployment) {
  return createPublicClient({ chain: hardhat, transport: http(dep.rpcUrl) });
}

export function walletFor(role: Role, dep: Deployment) {
  return createWalletClient({
    account: privateKeyToAccount(DEV_KEYS[role]),
    chain: hardhat,
    transport: http(dep.rpcUrl),
  });
}

export const STATE_NAMES = [
  "Draft",
  "Agreed",
  "Funded",
  "ReleasePending",
  "Released",
  "Refunded",
] as const;
