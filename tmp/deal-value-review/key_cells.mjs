import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-09.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

const cells = {
  Assumptions: ["F14", "F15", "F64", "F65", "F66", "F73", "F74", "F75", "F76", "F77", "F78", "F88", "F89", "F90", "F136", "F137"],
  P_and_L: [],
  P_and_L_5yr: ["C7", "C8", "C9", "D8", "E8", "F8", "G8"],
  Tier_Economics: ["B4", "B5", "B8", "B9", "B12", "C8", "C9", "C12", "D8", "D9", "D12", "E8", "E9", "E12", "B20", "C20", "D20"],
  Scenario_Engine: ["H8", "H9", "H10", "H11", "H12", "H13", "H19", "H30", "I8", "I9", "I10", "I19", "I30", "L8", "L9", "L10", "L19", "L30", "H42", "H47"],
  Revenue_Risk_AddOns: ["B18", "B24"],
};

for (const [alias, addresses] of Object.entries(cells)) {
  if (!addresses.length) continue;
  const sheetName = alias === "P_and_L_5yr" ? "P&L_5yr" : alias;
  const sheet = workbook.worksheets.getItem(sheetName);
  for (const address of addresses) {
    const range = sheet.getRange(address);
    console.log(`${sheetName}!${address}\tvalue=${JSON.stringify(range.values[0][0])}\tformula=${JSON.stringify(range.formulas[0][0])}`);
  }
}
