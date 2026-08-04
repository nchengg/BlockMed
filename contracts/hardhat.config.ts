import type { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

// Chain config note (plans/implementation-phases.md "Chain selection & failover"):
// baseSepolia is the primary network; a failover to another EVM/OP-stack testnet is a
// config-only change here plus new Ignition parameters — never a contract change (AP-6).
const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem],
  solidity: {
    version: "0.8.28",
  },
  networks: {
    // Local demo chain (`npx hardhat node`) — required by scripts/deploy-local.ts,
    // which app/lib/escrow/chain.ts depends on for deployments/local.json.
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    baseSepolia: {
      type: "http",
      chainType: "op",
      url: configVariable("BASE_SEPOLIA_RPC_URL"),
      accounts: [configVariable("BASE_SEPOLIA_PRIVATE_KEY")],
      chainId: 84532,
    },
  },
};

export default config;
