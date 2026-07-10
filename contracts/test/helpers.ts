import { keccak256, toHex, parseUnits } from "viem";

export const DEAL_ID = keccak256(toHex("demo-deal-1"));
export const AMOUNT = parseUnits("100", 6); // 100 mUSDC, 6-decimal base units

// Mirrors the Solidity enum order exactly (TR-6.1.2: single shared int↔name mapping).
export const State = {
  Draft: 0,
  Agreed: 1,
  Funded: 2,
  ReleasePending: 3,
  Released: 4,
  Refunded: 5,
  Cancelled: 6,
} as const;

export async function deployFixture(viem: any) {
  const [deployer, admin, releaser, buyer, seller, outsider] =
    await viem.getWalletClients();

  const usdc = await viem.deployContract("MockUSDC");
  const escrow = await viem.deployContract("Escrow", [
    usdc.address,
    admin.account.address,
    releaser.account.address,
  ]);

  return { usdc, escrow, deployer, admin, releaser, buyer, seller, outsider };
}

export async function createDemoDeal(f: any) {
  await f.escrow.write.createDeal(
    [DEAL_ID, f.buyer.account.address, f.seller.account.address, AMOUNT],
    { account: f.releaser.account },
  );
}

export async function fundDemoDeal(f: any) {
  await f.usdc.write.mint([f.buyer.account.address, AMOUNT]);
  await f.usdc.write.approve([f.escrow.address, AMOUNT], {
    account: f.buyer.account,
  });
  await f.escrow.write.deposit([DEAL_ID], { account: f.buyer.account });
}
