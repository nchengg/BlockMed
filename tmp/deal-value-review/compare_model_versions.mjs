import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const models = [
  {
    label: "original-path",
    path: "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-09.xlsx",
  },
  {
    label: "outputs-revised",
    path: "C:/Users/cwbec/BlockMed/outputs/deal-value-update-2026-08-11/Blockmediary_Financial_Model_Detailed_2026-08-11.xlsx",
  },
];

for (const model of models) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(model.path));
  const assumptions = workbook.worksheets.getItem("Assumptions");
  const pl = workbook.worksheets.getItem("P&L_5yr");
  const checks = workbook.worksheets.getItem("Model_Checks");
  const sensitivity = workbook.worksheets.getItem("Sensitivity");
  console.log(JSON.stringify({
    label: model.label,
    path: model.path,
    legacyDealValue: assumptions.getRange("F14:F15").values,
    tierDealValues: assumptions.getRange("F170:F175").values,
    pAndLDealValues: pl.getRange("C8:G8").values,
    pAndLDealValueFormulas: pl.getRange("C8:G8").formulas,
    modelStatus: checks.getRange("B4").values[0][0],
    sensitivityRows: sensitivity.getRange("B25:I36").values,
  }));
}
