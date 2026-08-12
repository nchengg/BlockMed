import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-09.xlsx";
const outputDir = "C:/Users/cwbec/BlockMed/outputs/deal-value-update-2026-08-11";
const outputPath = `${outputDir}/Blockmediary_Financial_Model_Detailed_2026-08-11.xlsx`;

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

function setValues(sheet, address, values) {
  sheet.getRange(address).values = values;
}

function setFormula(sheet, address, formula) {
  sheet.getRange(address).formulas = [[formula]];
}

function columnName(index) {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function addTierDealValueAssumptions() {
  const sheet = workbook.worksheets.getItem("Assumptions");

  setValues(sheet, "B14:H14", [[
    "Legacy shared deal value (not used)", null, null, null, null, "GBP/deal",
    "Deprecated 11 Aug 2026; replaced by the tier-specific assumptions below."
  ]]);
  setValues(sheet, "B15:H15", [[
    "Legacy shared deal-value growth (not used)", null, null, null, null, "% per year",
    "Deprecated 11 Aug 2026; no model formulas should reference this row."
  ]]);

  sheet.getRange("A169:H169").copyFrom(sheet.getRange("A63:H63"), "all");
  setValues(sheet, "A169:H169", [[
    null, "TIER-SPECIFIC DEAL VALUES", null, null, null, null, null,
    "Source: Blockmediary Deal-Value Research Report and Model, 11 Aug 2026."
  ]]);
  sheet.getRange("B169:H169").format.fill = "#1F4E78";
  sheet.getRange("B169:H169").format.font = { bold: true, color: "#FFFFFF" };
  sheet.getRange("B169:H169").format.rowHeight = 22;

  const rows = [
    { row: 170, template: 76, label: "Tier A — Year 1 base deal value", value: 35000, unit: "GBP/deal", note: "Base case from deal-value research; fixed across volume scenarios." },
    { row: 171, template: 15, label: "Tier A — annual deal-value growth", value: 0.10, unit: "% per year", note: "Exact annual compounding; independent of customer-volume scenario." },
    { row: 172, template: 76, label: "Tier B — Year 1 base deal value", value: 30000, unit: "GBP/deal", note: "Base case from deal-value research; fixed across volume scenarios." },
    { row: 173, template: 15, label: "Tier B — annual deal-value growth", value: 0.08, unit: "% per year", note: "Exact annual compounding; independent of customer-volume scenario." },
    { row: 174, template: 76, label: "Tier C — Year 1 base deal value", value: 30000, unit: "GBP/deal", note: "Base case from deal-value research; fixed across volume scenarios." },
    { row: 175, template: 15, label: "Tier C — annual deal-value growth", value: 0.05, unit: "% per year", note: "Exact annual compounding; independent of customer-volume scenario." },
  ];

  for (const item of rows) {
    sheet.getRange(`A${item.row}:H${item.row}`).copyFrom(sheet.getRange(`A${item.template}:H${item.template}`), "all");
    setValues(sheet, `A${item.row}:H${item.row}`, [[null, item.label, null, null, null, item.value, item.unit, item.note]]);
  }
  sheet.getRange("B170:H175").format.borders = { preset: "inside", style: "thin", color: "#D9E2F3" };
  sheet.getRange("B170:H175").format.rowHeight = 22;
  sheet.getRange("F170:F175").format.fill = "#FFF2CC";
  sheet.getRange("F170:F175").format.font = { color: "#0000FF" };
  sheet.getRange("F170").format.numberFormat = [["£#,##0"]];
  sheet.getRange("F172").format.numberFormat = [["£#,##0"]];
  sheet.getRange("F174").format.numberFormat = [["£#,##0"]];
  sheet.getRange("F171").format.numberFormat = [["0%"]];
  sheet.getRange("F173").format.numberFormat = [["0%"]];
  sheet.getRange("F175").format.numberFormat = [["0%"]];
  sheet.getRange("H169:H175").format.wrapText = true;
}

const yearTierColumns = [
  ["B", "C", "D", "E"],
  ["F", "G", "H", "I"],
  ["J", "K", "L", "M"],
  ["N", "O", "P", "Q"],
  ["R", "S", "T", "U"],
];

function tierValueFormula(tier, yearIndex) {
  const startRows = { A: 170, B: 172, C: 174 };
  const growthRows = { A: 171, B: 173, C: 175 };
  if (yearIndex === 0) return `=Assumptions!$F$${startRows[tier]}`;
  return `=Assumptions!$F$${startRows[tier]}*(1+Assumptions!$F$${growthRows[tier]})^${yearIndex}`;
}

function updateTierEconomics() {
  const sheet = workbook.worksheets.getItem("Tier_Economics");
  yearTierColumns.forEach(([aCol, bCol, cCol, totalCol], yearIndex) => {
    setFormula(sheet, `${aCol}8`, tierValueFormula("A", yearIndex));
    setFormula(sheet, `${bCol}8`, tierValueFormula("B", yearIndex));
    setFormula(sheet, `${cCol}8`, tierValueFormula("C", yearIndex));
    setFormula(sheet, `${totalCol}8`, `=IF(${totalCol}5=0,0,${totalCol}9/${totalCol}5)`);
  });
}

function updateMainPL() {
  const sheet = workbook.worksheets.getItem("P&L_5yr");
  const tierTotals = ["E", "I", "M", "Q", "U"];
  const plCols = ["C", "D", "E", "F", "G"];
  sheet.getRange("C8:G8").copyFrom(sheet.getRange("C9:G9"), "all");
  plCols.forEach((plCol, yearIndex) => {
    setFormula(sheet, `${plCol}9`, `='Tier_Economics'!${tierTotals[yearIndex]}9`);
    setFormula(sheet, `${plCol}8`, `=IF(${plCol}7=0,0,${plCol}9/${plCol}7)`);
  });
  sheet.getRange("C8:G8").format.numberFormat = sheet.getRange("C9:G9").format.numberFormat;
  sheet.getRange("C8:G8").format.font = { color: "#008000" };
}

function updateScenarioEngine() {
  const sheet = workbook.worksheets.getItem("Scenario_Engine");
  const groups = [
    ["B", "C", "D", "E", "F"],
    ["H", "I", "J", "K", "L"],
    ["N", "O", "P", "Q", "R"],
  ];

  groups.forEach((columns) => {
    columns.forEach((col, yearIndex) => {
      const [aCol, bCol, cCol] = yearTierColumns[yearIndex];
      const aValue = `'Tier_Economics'!$${aCol}$8`;
      const bValue = `'Tier_Economics'!$${bCol}$8`;
      const cValue = `'Tier_Economics'!$${cCol}$8`;
      setFormula(sheet, `${col}10`, `=${col}8*(${col}11*${aValue}+${col}12*${bValue}+${col}13*${cValue})`);
      setFormula(sheet, `${col}9`, `=IF(${col}8=0,0,${col}10/${col}8)`);
      setFormula(
        sheet,
        `${col}19`,
        `=${col}8*(${col}11*MAX(${aValue}*Assumptions!$F$73,Assumptions!$F$76)+${col}12*MAX(${bValue}*Assumptions!$F$74,Assumptions!$F$77)+${col}13*MAX(${cValue}*Assumptions!$F$75,Assumptions!$F$78))`
      );
    });
  });
}

function updateSensitivity() {
  const sheet = workbook.worksheets.getItem("Sensitivity");
  const currencyTemplate = workbook.worksheets.getItem("Tier_Economics").getRange("B8");
  const percentageTemplate = workbook.worksheets.getItem("Assumptions").getRange("F171");

  setValues(sheet, "D10:D10", [["Tier-specific deal values"]]);
  setFormula(sheet, "E10", "=Assumptions!B170");
  setValues(sheet, "F10:F10", [["Assumptions!B170:B175"]]);
  setFormula(sheet, "G10", '="A GBP "&TEXT(Assumptions!F170,"#,##0")&" @ "&TEXT(Assumptions!F171,"0%")&"; B GBP "&TEXT(Assumptions!F172,"#,##0")&" @ "&TEXT(Assumptions!F173,"0%")&"; C GBP "&TEXT(Assumptions!F174,"#,##0")&" @ "&TEXT(Assumptions!F175,"0%")');
  setValues(sheet, "I10:I10", [["Use the independent deal-value cases below; do not automatically combine ticket-size upside with the High volume scenario."]]);

  sheet.getRange("B25:I25").copyFrom(sheet.getRange("B2:I2"), "all");
  sheet.mergeCells("B25:I25");
  setValues(sheet, "B25:B25", [["DEAL-VALUE SENSITIVITY — INDEPENDENT OF COMMERCIAL SCENARIO"]]);
  sheet.getRange("B25:I25").format.fill = "#1F4E78";
  sheet.getRange("B25:I25").format.font = { bold: true, color: "#FFFFFF", size: 10 };
  sheet.getRange("B25:I25").format.verticalAlignment = "center";
  sheet.getRange("B25:I25").format.rowHeight = 24;

  sheet.getRange("B26:I26").copyFrom(sheet.getRange("B6:I6"), "all");
  setValues(sheet, "B26:I26", [[
    "Tier", "Case", "Year 1 (GBP)", "Annual growth", "Year 5 (GBP)",
    "Commercial interpretation", "Model use", "Source / status"
  ]]);
  sheet.getRange("B26:I26").format.fill = "#2F5597";
  sheet.getRange("B26:I26").format.font = { bold: true, color: "#FFFFFF", size: 9 };
  sheet.getRange("B26:I26").format.horizontalAlignment = "center";
  sheet.getRange("B26:I26").format.verticalAlignment = "center";
  sheet.getRange("B26:I26").format.wrapText = true;
  sheet.getRange("B26:I26").format.rowHeight = 32;
  sheet.getRange("B26:I26").format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };

  const cases = [
    ["A", "Low", 25000, 0.04, "Conservative initial use and expansion."],
    ["A", "Base", 35000, 0.10, "Implemented operating assumption."],
    ["A", "High", 50000, 0.15, "Strong adoption and wallet expansion."],
    ["B", "Low", 20000, 0.03, "Commercially stressed; fee burden is material at this size."],
    ["B", "Base", 30000, 0.08, "Implemented operating assumption."],
    ["B", "High", 45000, 0.13, "Strong adoption and repeat usage."],
    ["C", "Low", 20000, 0.02, "Commercially stressed; customer fee is approximately 4% at GBP 20k."],
    ["C", "Base", 30000, 0.05, "Implemented operating assumption."],
    ["C", "High", 45000, 0.10, "Larger and more frequent repeat transactions."],
  ];

  cases.forEach((item, index) => {
    const row = 27 + index;
    sheet.getRange(`B${row}:I${row}`).copyFrom(sheet.getRange("B7:I7"), "all");
    sheet.getRange(`D${row}`).copyFrom(currencyTemplate, "all");
    sheet.getRange(`E${row}`).copyFrom(percentageTemplate, "all");
    sheet.getRange(`F${row}`).copyFrom(currencyTemplate, "all");
    setValues(sheet, `B${row}:I${row}`, [[
      item[0], item[1], item[2], item[3], null, item[4],
      "Sensitivity only; not linked to the scenario engine.",
      "Deal-value research, 11 Aug 2026"
    ]]);
    setFormula(sheet, `F${row}`, `=D${row}*(1+E${row})^4`);
    sheet.getRange(`D${row}`).format.numberFormat = currencyTemplate.format.numberFormat;
    sheet.getRange(`E${row}`).format.numberFormat = percentageTemplate.format.numberFormat;
    sheet.getRange(`F${row}`).format.numberFormat = currencyTemplate.format.numberFormat;
  });

  sheet.getRange("B36:I36").copyFrom(sheet.getRange("B3:I3"), "all");
  sheet.mergeCells("B36:I36");
  setValues(sheet, "B36:B36", [[
    "Sensitivity cases are deliberately separate from Low / Base / High customer-volume scenarios to prevent unintentional growth stacking."
  ]]);
  sheet.getRange("B27:I35").format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
  sheet.getRange("B27:I35").format.fill = "#FFFFFF";
  sheet.getRange("B27:I35").format.verticalAlignment = "center";
  sheet.getRange("B27:I35").format.wrapText = true;
  sheet.getRange("B27:I35").format.rowHeight = 34;
  for (const row of [28, 31, 34]) sheet.getRange(`B${row}:I${row}`).format.fill = "#E2F0D9";
  sheet.getRange("D27:E35").format.font = { color: "#0000FF" };
  sheet.getRange("F27:F35").format.font = { color: "#008000" };
  sheet.getRange("B36:I36").format.fill = "#D9E2F3";
  sheet.getRange("B36:I36").format.font = { italic: true, color: "#44546A", size: 9 };
  sheet.getRange("B36:I36").format.wrapText = true;
  sheet.getRange("B36:I36").format.rowHeight = 30;
}

function updateReadme() {
  const sheet = workbook.worksheets.getItem("README");
  const growthReplacement = "[RESOLVED 11 AUG 2026] Deal values are tier-specific: Tier A GBP 35k at 10% annual growth; Tier B GBP 30k at 8%; Tier C GBP 30k at 5%. The blended average is derived from tier mix and tier GMV. Source: Blockmediary Deal-Value Research Report and Model, 11 August 2026.";
  const capReplacement = "[SCOPE NOTE] The GBP 50k automatic-verdict control remains an operational rule outside this commercial update. No incremental above-cap review-cost module is included; existing review and QA cost logic is unchanged.";
  setValues(sheet, "B3", [["Programmable documentary escrow for SME cross-border trade. Commercial deal-value refresh: 11 Aug 2026."]]);
  setValues(sheet, "B77", [["Updated 11 August 2026. Detailed model uses 14 sheets and tier-specific deal values from the 11 August research pack."]]);
  setValues(sheet, "B94", [[growthReplacement]]);
  setValues(sheet, "B95", [[capReplacement]]);
  sheet.getRange("B94:W94").format.font = { color: "#008000" };
  sheet.getRange("B95:W95").format.font = { color: "#595959" };
}

function addModelChecks() {
  const sheet = workbook.worksheets.getItem("Model_Checks");
  setFormula(sheet, "B4", '=IF(COUNTIF(F7:F25,"FAIL")>0,"FAIL","PASS")');

  const checks = [
    {
      row: 21,
      label: "Tier deal-value assumptions populated",
      actual: "=COUNT(Assumptions!$F$170:$F$175)",
      expected: "=6",
      tolerance: 0,
      note: "All three Year-1 values and all three annual growth rates must be numeric."
    },
    {
      row: 22,
      label: "Tier GMV ties to five-year P&L",
      actual: "=ROUND(SUM(ABS('Tier_Economics'!E9-'P&L_5yr'!C9),ABS('Tier_Economics'!I9-'P&L_5yr'!D9),ABS('Tier_Economics'!M9-'P&L_5yr'!E9),ABS('Tier_Economics'!Q9-'P&L_5yr'!F9),ABS('Tier_Economics'!U9-'P&L_5yr'!G9)),2)",
      expected: "=0",
      tolerance: 0.01,
      note: "P&L GMV must be sourced from the tier-level calculation."
    },
    {
      row: 23,
      label: "Blended deal values reconcile",
      actual: "=ROUND(SUM(ABS('P&L_5yr'!C8-IF('P&L_5yr'!C7=0,0,'P&L_5yr'!C9/'P&L_5yr'!C7)),ABS('P&L_5yr'!D8-IF('P&L_5yr'!D7=0,0,'P&L_5yr'!D9/'P&L_5yr'!D7)),ABS('P&L_5yr'!E8-IF('P&L_5yr'!E7=0,0,'P&L_5yr'!E9/'P&L_5yr'!E7)),ABS('P&L_5yr'!F8-IF('P&L_5yr'!F7=0,0,'P&L_5yr'!F9/'P&L_5yr'!F7)),ABS('P&L_5yr'!G8-IF('P&L_5yr'!G7=0,0,'P&L_5yr'!G9/'P&L_5yr'!G7))),6)",
      expected: "=0",
      tolerance: 0.000001,
      note: "The displayed average must equal total GMV divided by deal count."
    },
    {
      row: 24,
      label: "Tier escrow revenue ties to P&L",
      actual: "=ROUND(SUM('P&L_5yr'!C14:G14),2)",
      expected: "=ROUND(SUM('Tier_Economics'!E12,'Tier_Economics'!I12,'Tier_Economics'!M12,'Tier_Economics'!Q12,'Tier_Economics'!U12),2)",
      tolerance: 1,
      note: "Escrow revenue must retain tier-specific rates and minimum fees."
    },
    {
      row: 25,
      label: "Selected scenario GMV ties to P&L",
      actual: "=ROUND(CHOOSE(Assumptions!$C$4,SUM(Scenario_Engine!B10:F10),SUM(Scenario_Engine!H10:L10),SUM(Scenario_Engine!N10:R10)),2)",
      expected: "=ROUND(SUM('P&L_5yr'!C9:G9),2)",
      tolerance: 5,
      note: "The active Low / Base / High volume scenario must use the same tier-value schedule as the P&L."
    },
  ];

  for (const check of checks) {
    sheet.getRange(`A${check.row}:G${check.row}`).copyFrom(sheet.getRange("A20:G20"), "all");
    setValues(sheet, `A${check.row}:G${check.row}`, [[check.label, null, null, null, check.tolerance, null, check.note]]);
    setFormula(sheet, `B${check.row}`, check.actual);
    setFormula(sheet, `C${check.row}`, check.expected);
    setFormula(sheet, `D${check.row}`, `=B${check.row}-C${check.row}`);
    setFormula(sheet, `F${check.row}`, `=IF(ABS(D${check.row})<=E${check.row},"PASS","FAIL")`);
  }
}

function assertLegacyReferencesRemoved() {
  const offending = [];
  for (const sheet of workbook.worksheets.items) {
    const used = sheet.getUsedRange();
    if (!used) continue;
    const formulas = used.formulas;
    for (let row = 0; row < formulas.length; row += 1) {
      for (let col = 0; col < formulas[row].length; col += 1) {
        const formula = formulas[row][col];
        if (typeof formula === "string" && /Assumptions!\$?F\$?1[45](?!\d)/i.test(formula)) {
          offending.push(`${sheet.name}!${columnName(col)}${row + 1}: ${formula}`);
        }
      }
    }
  }
  if (offending.length) {
    throw new Error(`Legacy deal-value formulas remain:\n${offending.join("\n")}`);
  }
}

addTierDealValueAssumptions();
updateTierEconomics();
updateMainPL();
updateScenarioEngine();
updateSensitivity();
updateReadme();
addModelChecks();
assertLegacyReferencesRemoved();

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(`saved=${outputPath}`);
