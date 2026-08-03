# Testing with real wallets

How to link and use real MetaMask wallets against the local chain. Everything
here runs locally with fake money — no faucet, no real ETH, nothing at risk.

## Why linking exists

Storing an address someone typed into a box proves nothing: anyone can type
anyone's address. The only proof that a company controls a wallet is a
**signature** from that wallet's private key, over a message our server chose.

That is what linking does. The server issues a one-time random `nonce`, the
wallet signs a readable message containing it, and the server checks the
signature recovers to the claimed address. The nonce is deleted on use, so a
signature captured from anywhere else cannot be replayed to link a wallet the
attacker does not control.

Signing a message is **free and moves no funds**. It is not a transaction.

## One-time MetaMask setup

1. Install the [MetaMask extension](https://metamask.io) in Chrome.
2. Start the local chain — in `contracts/`:
   ```bash
   npx hardhat node
   ```
   It prints 20 test accounts with their private keys. These keys are public
   and identical on every Hardhat install, so **never send real funds to them**.
3. Add the local network in MetaMask (Settings → Networks → Add network manually):
   - **Network name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency symbol:** ETH
4. Import two of the printed accounts (Account menu → Import account → paste
   private key). Two lets you play buyer and seller.

## Linking a wallet

1. Start the app (in `app/`): `npm run dev`
2. Sign in at http://localhost:3000/dan
3. On the Dashboard, find the **WALLET** card and press **Link wallet**.
4. MetaMask asks to connect — approve it.
5. MetaMask then shows a **signature request**. Read it: it says linking does
   not authorise any transaction. Sign it.
6. The card now shows your address.

If MetaMask does not appear, the card says "No browser wallet detected" — that
means the extension is not installed or not enabled for this site.

## Testing two companies at once

A wallet can only be linked to one company (the server returns 409 otherwise),
so use two separate browser profiles:

- **Profile 1** → signed in as the buyer company → MetaMask Account #1
- **Profile 2** → signed in as the seller company → MetaMask Account #2

Chrome profiles keep both cookies and MetaMask state separate, which an
incognito window does not do reliably.

## What is verified automatically

`lib/auth/siwe.test.ts` covers the crypto, including the two cases that matter:

- a valid signature from a **different** key is rejected (impersonation)
- a signature over a **different message** is rejected (replay)

Run them with `npm run test` in `app/`.

## What still needs a human

I cannot click MetaMask popups — they are browser-extension UI outside the
page. So the steps above are a genuine manual handoff. Everything up to the
popup (nonce issuing, signature verification, the uniqueness check, unlinking)
is covered by automated tests against the running server.

## Known limits right now

- Linking records the address. **Deposits still sign from the shared dev key**,
  not the linked wallet — moving them to user-signed transactions is the next
  step, and it is the only part that needs the user's wallet to sign a real
  transaction rather than a message.
- Base Sepolia is not wired up yet. It needs a faucet top-up and a deployment;
  the local chain proves the flow first.
