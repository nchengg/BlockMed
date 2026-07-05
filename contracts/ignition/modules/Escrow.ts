import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// All three constructor inputs are deploy parameters (TR-9.1.2, TR-2.4): no hardcoded
// addresses, so a failover redeploy to another EVM L2 needs only new parameters.
//
// Base Sepolia deploy:
//   npx hardhat ignition deploy ignition/modules/Escrow.ts --network baseSepolia \
//     --parameters '{"EscrowModule":{"usdcAddress":"0x036CbD53842c5426634e7929541eC2318f3dCF7e","admin":"0x…","releaser":"0x…"}}'
export default buildModule("EscrowModule", (m) => {
  const usdcAddress = m.getParameter<string>("usdcAddress");
  const admin = m.getParameter<string>("admin");
  const releaser = m.getParameter<string>("releaser");

  const escrow = m.contract("Escrow", [usdcAddress, admin, releaser]);

  return { escrow };
});
