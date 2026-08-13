// Deploy Escrow to Base MAINNET, against Circle's native USDC. REAL FUNDS.
//
// This is the Base Sepolia script pointed at mainnet. The contract is byte-for-byte
// the same (AP-6: chain portability is config-only). What differs is the stakes:
//
//   1. Native USDC. The escrow points at Circle's canonical USDC on Base mainnet.
//      Nothing here can mint it — the buyer must already hold real USDC, and every
//      deposit moves real money. Keep demo amounts tiny.
//
//   2. Admin and releaser are DIFFERENT addresses (constructor takes them
//      separately). A leaked releaser key must not also pause or cancel deals.
//
//   3. No buyer/seller accounts are recorded — parties sign from their own wallets.
//
// Deploying spends real ETH on Base. Fund the deployer first.
//
// Run:  npx hardhat run scripts/deploy-base-mainnet.ts --network base
import { network } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { privateKeyToAccount } from "viem/accounts";
import path from "node:path";

// Hardhat does not load .env for scripts, and configVariable() is a different
// mechanism (encrypted secrets). Load it here so one file holds the keys.
process.loadEnvFile?.(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env"));

// Circle's canonical (native) USDC on Base mainnet — NOT the bridged USDbC.
// 6 decimals, symbol "USDC". The on-chain check below refuses anything else,
// so a wrong address (e.g. USDbC, symbol "USDbC") fails fast rather than binding
// the escrow to a token it cannot pay out.
// https://developers.circle.com/stablecoins/usdc-on-main-networks
const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const CHAIN_ID = 8453;

const releaserKey = process.env.BASE_MAINNET_PRIVATE_KEY;
const adminKey = process.env.BASE_MAINNET_ADMIN_PRIVATE_KEY;
if (!releaserKey) throw new Error("BASE_MAINNET_PRIVATE_KEY is not set (see contracts/.env).");
if (!adminKey) throw new Error("BASE_MAINNET_ADMIN_PRIVATE_KEY is not set (see contracts/.env).");

const releaserAddress = privateKeyToAccount(releaserKey as `0x${string}`).address;
const adminAddress = privateKeyToAccount(adminKey as `0x${string}`).address;

if (releaserAddress.toLowerCase() === adminAddress.toLowerCase()) {
  throw new Error(
    "Admin and releaser are the same address. Use separate keys so one leak does " +
      "not confer both verdict-recording and pause/cancel powers.",
  );
}

const { viem } = await network.connect({ network: "base", chainType: "op" });
const pc = await viem.getPublicClient();

// Fail early and clearly rather than mid-deploy on an out-of-gas revert.
const balance = await pc.getBalance({ address: releaserAddress });
if (balance === 0n) {
  throw new Error(
    `Deployer ${releaserAddress} has no ETH on Base mainnet. Fund it before deploying.`,
  );
}

// Sanity-check the token really is a 6-decimal USDC before binding the escrow to
// it — an escrow pointed at the wrong address would take deposits it cannot pay out.
const erc20 = [
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;
const symbol = await pc.readContract({ address: USDC_BASE_MAINNET, abi: erc20, functionName: "symbol" });
const decimals = await pc.readContract({ address: USDC_BASE_MAINNET, abi: erc20, functionName: "decimals" });
if (symbol !== "USDC" || Number(decimals) !== 6) {
  throw new Error(`Token at ${USDC_BASE_MAINNET} is ${symbol} with ${decimals} decimals — expected USDC/6.`);
}

console.log("Deploying to Base MAINNET (real funds)");
console.log("  token   :", USDC_BASE_MAINNET, `(${symbol}, ${decimals} dp)`);
console.log("  admin   :", adminAddress);
console.log("  releaser:", releaserAddress);

const escrow = await viem.deployContract("Escrow", [
  USDC_BASE_MAINNET,
  adminAddress,    // DEFAULT_ADMIN_ROLE — pause/unpause, cancel, role management
  releaserAddress, // RELEASER_ROLE — createDeal, recordVerdict, refund
]);

const deployment = {
  chainId: CHAIN_ID,
  rpcUrl: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
  usdc: USDC_BASE_MAINNET,
  escrow: escrow.address,
  // Only the releaser: the parties sign from their own wallets, and the admin
  // key is not used by the app at runtime.
  accounts: { releaser: releaserAddress },
  admin: adminAddress,
  realToken: true,
  explorer: "https://basescan.org",
  deployedAt: new Date().toISOString(),
};

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "deployments");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "base.json"), JSON.stringify(deployment, null, 2) + "\n");

console.log("");
console.log("Escrow deployed:", escrow.address);
console.log("Explorer:", `https://basescan.org/address/${escrow.address}`);
console.log("Written: deployments/base.json");
