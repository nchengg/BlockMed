import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-09.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

for (const [sheetName, rangeAddress] of [["P&L_5yr", "B5:H72"], ["Revenue_Risk_AddOns", "A3:G24"], ["Sensitivity", "A1:I23"]]) {
  const rows = workbook.worksheets.getItem(sheetName).getRange(rangeAddress).values;
  console.log(`===== ${sheetName}!${rangeAddress} =====`);
  rows.forEach((row, index) => console.log(`${index + Number(rangeAddress.match(/\d+/)[0])}\t${row.map(v => v ?? "").join("\t")}`));
  if (sheetName === "Sensitivity") {
    const formulas = workbook.worksheets.getItem(sheetName).getRange(rangeAddress).formulas;
    console.log(`===== ${sheetName}!${rangeAddress} FORMULAS =====`);
    formulas.forEach((row, index) => console.log(`${index + Number(rangeAddress.match(/\d+/)[0])}\t${row.map(v => v ?? "").join("\t")}`));
  }
}
