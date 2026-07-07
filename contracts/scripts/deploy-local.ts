// Local demo bootstrap: deploy MockUSDC + Escrow to the localhost Hardhat node,
// mint test USDC to the buyer, and write addresses to deployments/local.json for
// the web app. Accounts (standard pre-funded dev accounts, publicly known keys):
//   #0 admin + releaser · #1 buyer · #2 seller
//
// Run:  npx hardhat run scripts/deploy-local.ts --network localhost
import { network } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const { viem } = await network.connect({ network: "localhost" });

const [admin, buyer, seller] = await viem.getWalletClients();

const usdc = await viem.deployContract("MockUSDC", []);
const escrow = await viem.deployContract("Escrow", [
  usdc.address,
  admin.account.address, // DEFAULT_ADMIN_ROLE
  admin.account.address, // RELEASER_ROLE (same key for the local demo)
]);

// 10,000 test USDC (6 decimals) for the buyer to escrow from.
await usdc.write.mint([buyer.account.address, 10_000_000_000n]);

const deployment = {
  chainId: 31337,
  rpcUrl: "http://127.0.0.1:8545",
  usdc: usdc.address,
  escrow: escrow.address,
  accounts: {
    releaser: admin.account.address,
    buyer: buyer.account.address,
    seller: seller.account.address,
  },
  deployedAt: new Date().toISOString(),
};

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "deployments");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "local.json"), JSON.stringify(deployment, null, 2) + "\n");

console.log("MockUSDC:", usdc.address);
console.log("Escrow:  ", escrow.address);
console.log("Buyer funded with 10,000 mUSDC:", buyer.account.address);
console.log("Seller:", seller.account.address);
console.log("Written: deployments/local.json");
