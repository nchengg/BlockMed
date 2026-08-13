# data/

Datasets the agents work on. **Sandbox or synthetic only — never real customer/PII data.**

## Blockmediary data sources

- **Sample sale contracts** — synthetic SME-export sale agreements for the `deal-intake` agent's term-extraction pipeline. Mix of clean and intentionally noisy formats to test OCR/AI robustness.
- **Trade document sets** — synthetic shipment-document bundles (commercial invoice, packing list, bill of lading / sea waybill / air waybill, certificate of origin, inspection certificate, insurance certificate). Used by `document-checker` rules-engine + extraction agents. Include realistic mismatches (wrong amount, name typo, late shipment) to test the rules engine.
- **KYC / KYB sandbox** — sanctions list snapshots (OFAC, UN, HMT — all public), plus synthetic identity records. No real PII.
- **Escrow specifications** — sample canonical JSON escrow specs (see `MVP_FLOW.md` example shape in Drive), spanning the in-scope corridor types.
- **On-chain escrow event logs** — Base Sepolia testnet output capturing state transitions for the escrow contract.
- **Stablecoin price feeds** — historical USDC / EURC from public sources (CoinGecko, ECB reference rates). Used for any display-time fiat-equivalent figures; MVP escrow is single-currency, so this is for UI not for release logic.

## Conventions

- Keep raw data in `data/raw/`, processed in `data/processed/`.
- Document each dataset's source, license, and schema in a short note next to it.
- Add large/raw files to `.gitignore` if needed; commit small samples for reproducibility.
- See [../docs/domain-rules.md](../docs/domain-rules.md) — money is stored in minor units, rounded only at display.
