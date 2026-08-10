// Deploy Escrow to Base Sepolia, against Circle's REAL testnet USDC.
//
// Differs from deploy-local.ts in three ways that matter:
//
//   1. No MockUSDC. The escrow points at Circle's own USDC contract, so the
//      token is the real thing — nothing here can mint it. Deal amounts are
//      therefore limited by what the faucet gives (20 USDC / 2h / address).
//
//   2. Admin and releaser are DIFFERENT addresses. The constructor has always
//      taken them separately; the local demo collapses them for convenience.
//      Splitting them means a leaked releaser key cannot also pause the
//      contract or cancel deals.
//
//   3. No buyer/seller accounts are recorded. On a public chain the parties
//      sign from their own linked wallets — the server holds no key for them,
//      and writing addresses here would imply otherwise.
//
// Run:  npx hardhat run scripts/deploy-base-sepolia.ts --network baseSepolia
import { network } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { privateKeyToAccount } from "viem/accounts";
import path from "node:path";

// Hardhat does not load .env for scripts, and configVariable() is a different
// mechanism (encrypted secrets). Load it here so one file holds the keys.
process.loadEnvFile?.(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env"));

// Circle's canonical USDC on Base Sepolia. Verified 6 decimals, symbol USDC.
// https://developers.circle.com/stablecoins/usdc-on-test-networks
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const CHAIN_ID = 84532;

const releaserKey = process.env.BASE_SEPOLIA_PRIVATE_KEY;
const adminKey = process.env.BASE_SEPOLIA_ADMIN_PRIVATE_KEY;
if (!releaserKey) throw new Error("BASE_SEPOLIA_PRIVATE_KEY is not set (see contracts/.env).");
if (!adminKey) throw new Error("BASE_SEPOLIA_ADMIN_PRIVATE_KEY is not set (see contracts/.env).");

const releaserAddress = privateKeyToAccount(releaserKey as `0x${string}`).address;
const adminAddress = privateKeyToAccount(adminKey as `0x${string}`).address;

if (releaserAddress.toLowerCase() === adminAddress.toLowerCase()) {
  throw new Error(
    "Admin and releaser are the same address. Use separate keys so one leak does " +
      "not confer both verdict-recording and pause/cancel powers.",
  );
}

const { viem } = await network.connect({ network: "baseSepolia", chainType: "op" });
const pc = await viem.getPublicClient();

// Fail early and clearly rather than mid-deploy on an out-of-gas revert.
const balance = await pc.getBalance({ address: releaserAddress });
if (balance === 0n) {
  throw new Error(
    `Deployer ${releaserAddress} has no ETH on Base Sepolia. Fund it before deploying.`,
  );
}

// Sanity-check the token really is a 6-decimal USDC before binding the escrow to
// it — an escrow pointed at the wrong address would take deposits it cannot pay out.
const erc20 = [
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;
const symbol = await pc.readContract({ address: USDC_BASE_SEPOLIA, abi: erc20, functionName: "symbol" });
const decimals = await pc.readContract({ address: USDC_BASE_SEPOLIA, abi: erc20, functionName: "decimals" });
if (symbol !== "USDC" || Number(decimals) !== 6) {
  throw new Error(`Token at ${USDC_BASE_SEPOLIA} is ${symbol} with ${decimals} decimals — expected USDC/6.`);
}

console.log("Deploying to Base Sepolia");
console.log("  token   :", USDC_BASE_SEPOLIA, `(${symbol}, ${decimals} dp)`);
console.log("  admin   :", adminAddress);
console.log("  releaser:", releaserAddress);

const escrow = await viem.deployContract("Escrow", [
  USDC_BASE_SEPOLIA,
  adminAddress,    // DEFAULT_ADMIN_ROLE — pause/unpause, cancel, role management
  releaserAddress, // RELEASER_ROLE — createDeal, recordVerdict, refund
]);

const deployment = {
  chainId: CHAIN_ID,
  rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
  usdc: USDC_BASE_SEPOLIA,
  escrow: escrow.address,
  // Only the releaser: the parties sign from their own wallets, and the admin
  // key is not used by the app at runtime.
  accounts: { releaser: releaserAddress },
  admin: adminAddress,
  realToken: true,
  explorer: "https://sepolia.basescan.org",
  deployedAt: new Date().toISOString(),
};

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "deployments");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "baseSepolia.json"), JSON.stringify(deployment, null, 2) + "\n");

console.log("");
console.log("Escrow deployed:", escrow.address);
console.log("Explorer:", `https://sepolia.basescan.org/address/${escrow.address}`);
console.log("Written: deployments/baseSepolia.json");
