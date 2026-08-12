import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-11.xlsx";
const outputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-11_Churn_Client_Funds.xlsx";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

function setValues(sheet, address, values) {
  sheet.getRange(address).values = values;
}

function setFormula(sheet, address, formula) {
  sheet.getRange(address).formulas = [[formula]];
}

function setFormulas(sheet, address, formulas) {
  sheet.getRange(address).formulas = [formulas];
}

function repeatFormat(value, count) {
  return [Array.from({ length: count }, () => value)];
}

function addAssumptions() {
  const sheet = workbook.worksheets.getItem("Assumptions");

  sheet.getRange("A177:H177").copyFrom(sheet.getRange("A169:H169"), "all");
  setValues(sheet, "A177:H177", [[
    null,
    "CUSTOMER RETENTION & CLIENT FUNDS",
    null,
    null,
    null,
    null,
    null,
    "Planning assumptions and hard controls added 11 Aug 2026."
  ]]);

  const rows = [
    [178, "Annual customer churn rate", 0.10, "% per year", "Planning assumption from Year 2. Annual deal volumes remain net targets; replace with observed cohort retention."],
    [179, "Average funded-to-release holding period", 14, "days", "Used only to estimate safeguarded client assets; replace with pilot telemetry."],
    [180, "Client escrow funds available to operations", 0, "%", "Hard control: customer funds are not corporate cash and cannot fund operations."],
    [181, "Client-asset yield recognised in model", 0, "%", "No yield or spread is recognised without legal, regulatory and accounting approval."]
  ];

  for (const [row, label, value, unit, note] of rows) {
    const templateRow = unit === "days" ? 170 : 171;
    sheet.getRange(`A${row}:H${row}`).copyFrom(sheet.getRange(`A${templateRow}:H${templateRow}`), "all");
    setValues(sheet, `A${row}:H${row}`, [[null, label, null, null, null, value, unit, note]]);
  }

  sheet.getRange("B177:H177").format.fill = "#1F4E78";
  sheet.getRange("B177:H177").format.font = { bold: true, color: "#FFFFFF" };
  sheet.getRange("B177:H177").format.rowHeight = 22;
  sheet.getRange("F178:F181").format.fill = "#FFF2CC";
  sheet.getRange("F178:F181").format.font = { color: "#0000FF" };
  sheet.getRange("F178").format.numberFormat = [["0%"]];
  sheet.getRange("F179").format.numberFormat = [["0"]];
  sheet.getRange("F180:F181").format.numberFormat = [["0%"], ["0%"]];
  sheet.getRange("H177:H181").format.wrapText = true;
  sheet.getRange("B178:H181").format.rowHeight = 30;
  sheet.getRange("B178:H181").format.borders = { preset: "inside", style: "thin", color: "#D9E2F3" };
}

function addCustomerBridge() {
  const sheet = workbook.worksheets.getItem("P&L_5yr");

  sheet.getRange("B76:H76").copyFrom(sheet.getRange("B67:H67"), "all");
  setValues(sheet, "B76:H76", [["CUSTOMER RETENTION & ACQUISITION BRIDGE", null, null, null, null, null, null]]);
  sheet.getRange("B76:H76").format.fill = "#1F4E78";
  sheet.getRange("B76:H76").format.font = { bold: true, color: "#FFFFFF" };

  sheet.getRange("B77:H77").copyFrom(sheet.getRange("B68:H68"), "all");
  setValues(sheet, "B77:H77", [["Line item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Unit / note"]]);

  const labels = [
    [78, "Target ending active customers", "Net commercial target implied by annual deal volume."],
    [79, "Beginning active customers", "Prior-year ending cohort; Year 1 begins at zero."],
    [80, "Annual customer churn rate", "Applied from Year 2; planning assumption until cohort data exist."],
    [81, "Churned customers", "Opening customers expected to leave during the year."],
    [82, "Retained opening customers", "Opening customers remaining after churn."],
    [83, "Gross new customers required", "New logos required to achieve the net ending-customer target."],
    [84, "Ending active customers", "Retained opening customers plus gross new customers."],
    [85, "Bridge check", "Must equal zero in every year."]
  ];

  for (const [row, label, note] of labels) {
    sheet.getRange(`B${row}:H${row}`).copyFrom(sheet.getRange(row === 78 ? "B70:H70" : "B69:H69"), "all");
    setValues(sheet, `B${row}:H${row}`, [[label, null, null, null, null, null, note]]);
  }

  setFormulas(sheet, "C78:G78", ["=C70", "=D70", "=E70", "=F70", "=G70"]);
  setFormulas(sheet, "C79:G79", ["=0", "=C84", "=D84", "=E84", "=F84"]);
  setFormulas(sheet, "C80:G80", ["=0", "='Assumptions'!$F$178", "='Assumptions'!$F$178", "='Assumptions'!$F$178", "='Assumptions'!$F$178"]);
  setFormulas(sheet, "C81:G81", ["=C79*C80", "=D79*D80", "=E79*E80", "=F79*F80", "=G79*G80"]);
  setFormulas(sheet, "C82:G82", ["=C79-C81", "=D79-D81", "=E79-E81", "=F79-F81", "=G79-G81"]);
  setFormulas(sheet, "C83:G83", ["=MAX(0,C78-C82)", "=MAX(0,D78-D82)", "=MAX(0,E78-E82)", "=MAX(0,F78-F82)", "=MAX(0,G78-G82)"]);
  setFormulas(sheet, "C84:G84", ["=C82+C83", "=D82+D83", "=E82+E83", "=F82+F83", "=G82+G83"]);
  setFormulas(sheet, "C85:G85", ["=C84-C78", "=D84-D78", "=E84-E78", "=F84-F78", "=G84-G78"]);

  sheet.getRange("C80:G80").format.numberFormat = repeatFormat("0%", 5);
  sheet.getRange("C78:G79").format.numberFormat = [repeatFormat("0.0", 5)[0], repeatFormat("0.0", 5)[0]];
  sheet.getRange("C81:G85").format.numberFormat = Array.from({ length: 5 }, () => repeatFormat("0.0", 5)[0]);
  sheet.getRange("C80:G80").format.font = { color: "#008000" };
  sheet.getRange("B76:H85").format.wrapText = true;
  sheet.getRange("B76:H85").format.borders = { preset: "inside", style: "thin", color: "#D9E2F3" };
  sheet.getRange("H78:H85").format.font = { color: "#595959", italic: true };
  sheet.getRange("B78:H85").format.rowHeight = 28;
}

function updateSensitivity() {
  const sheet = workbook.worksheets.getItem("Sensitivity");
  sheet.getRange("B19:I19").copyFrom(sheet.getRange("B18:I18"), "all");
  setValues(sheet, "B19:I19", [[
    13,
    "Customer churn",
    "Raises replacement acquisition required to maintain net annual deal targets.",
    null,
    "Assumptions!B178",
    null,
    "Gross acquisition requirement; sales capacity",
    "Raise or lower churn. Planned deal volumes remain net targets unless the commercial scenarios are also changed."
  ]]);
  setFormula(sheet, "E19", "='Assumptions'!B178");
  setFormula(sheet, "G19", '="Annual customer churn "&TEXT(\'Assumptions\'!F178,"0%")&" from Year 2"');
  sheet.getRange("E19").format.font = { color: "#008000" };
  sheet.getRange("G19").format.font = { color: "#008000" };
  sheet.getRange("B19:I19").format.wrapText = true;
  sheet.getRange("B19:I19").format.rowHeight = 38;
}

function updateCashFlowLabel() {
  const sheet = workbook.worksheets.getItem("Cash_Flow_Statement");
  setValues(sheet, "A18", [["Operating working capital (client escrow excluded)"]]);
}

function addClientFundsMemo() {
  const pl = workbook.worksheets.getItem("P&L_5yr");
  const currencyFormat = pl.getRange("C9").format.numberFormat;
  const sheet = workbook.worksheets.add("Client_Funds_Memo");

  sheet.mergeCells("A1:H1");
  setValues(sheet, "A1", [["Client Funds Memorandum — Safeguarded Escrow Scale"]]);
  sheet.getRange("A1:H1").format.fill = "#17365D";
  sheet.getRange("A1:H1").format.font = { bold: true, color: "#FFFFFF", size: 16 };
  sheet.getRange("A1:H1").format.verticalAlignment = "center";
  sheet.getRange("A1:H1").format.rowHeight = 34;

  sheet.mergeCells("A2:H2");
  setValues(sheet, "A2", [["Memorandum only: customer escrow is not revenue, unrestricted cash, runway liquidity or funding capacity."]]);
  sheet.getRange("A2:H2").format.fill = "#D9E2F3";
  sheet.getRange("A2:H2").format.font = { italic: true, color: "#44546A", size: 10 };
  sheet.getRange("A2:H2").format.rowHeight = 26;

  sheet.mergeCells("A4:H4");
  setValues(sheet, "A4", [["SAFEGUARDED CLIENT ESCROW — FIVE-YEAR MEMORANDUM"]]);
  sheet.getRange("A4:H4").format.fill = "#1F4E78";
  sheet.getRange("A4:H4").format.font = { bold: true, color: "#FFFFFF" };
  sheet.getRange("A4:H4").format.rowHeight = 24;

  setValues(sheet, "A5:H5", [["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Unit", "Treatment / note"]]);
  sheet.getRange("A5:H5").format.fill = "#2F5597";
  sheet.getRange("A5:H5").format.font = { bold: true, color: "#FFFFFF" };
  sheet.getRange("A5:H5").format.horizontalAlignment = "center";
  sheet.getRange("A5:H5").format.verticalAlignment = "center";
  sheet.getRange("A5:H5").format.rowHeight = 28;

  const rows = [
    [6, "Annual GMV", "GBP/year", "Commercial throughput sourced from the five-year P&L."],
    [7, "Average funded-to-release holding period", "days", "Planning assumption; replace with measured pilot cycle time."],
    [8, "Average safeguarded client assets", "GBP", "Annual GMV × holding days ÷ 365; memorandum balance only."],
    [9, "Matching client escrow liability", "GBP", "Equal and opposite obligation to customers / escrow beneficiaries."],
    [10, "Net client-funds balance", "GBP", "Client asset plus matching liability; must equal zero."],
    [11, "Availability to Blockmediary operating cash", "GBP", "Hard-control result: zero availability to operations."],
    [12, "Memorandum yield at assumed rate (not in P&L)", "GBP/year", "No yield or spread recognised in the model."]
  ];
  for (const [row, label, unit, note] of rows) {
    setValues(sheet, `A${row}:H${row}`, [[label, null, null, null, null, null, unit, note]]);
  }

  for (const row of [6, 8, 9, 10, 11, 12]) {
    sheet.getRange(`B${row}:F${row}`).copyFrom(pl.getRange("C9:G9"), "all");
  }

  setFormulas(sheet, "B6:F6", ["='P&L_5yr'!C9", "='P&L_5yr'!D9", "='P&L_5yr'!E9", "='P&L_5yr'!F9", "='P&L_5yr'!G9"]);
  setFormulas(sheet, "B7:F7", ["='Assumptions'!$F$179", "='Assumptions'!$F$179", "='Assumptions'!$F$179", "='Assumptions'!$F$179", "='Assumptions'!$F$179"]);
  setFormulas(sheet, "B8:F8", ["=B6/365*B7", "=C6/365*C7", "=D6/365*D7", "=E6/365*E7", "=F6/365*F7"]);
  setFormulas(sheet, "B9:F9", ["=-B8", "=-C8", "=-D8", "=-E8", "=-F8"]);
  setFormulas(sheet, "B10:F10", ["=B8+B9", "=C8+C9", "=D8+D9", "=E8+E9", "=F8+F9"]);
  setFormulas(sheet, "B11:F11", ["=B8*'Assumptions'!$F$180", "=C8*'Assumptions'!$F$180", "=D8*'Assumptions'!$F$180", "=E8*'Assumptions'!$F$180", "=F8*'Assumptions'!$F$180"]);
  setFormulas(sheet, "B12:F12", ["=B8*'Assumptions'!$F$181", "=C8*'Assumptions'!$F$181", "=D8*'Assumptions'!$F$181", "=E8*'Assumptions'!$F$181", "=F8*'Assumptions'!$F$181"]);

  for (const row of [6, 8, 9, 10, 11, 12]) {
    sheet.getRange(`B${row}:F${row}`).format.numberFormat = currencyFormat;
  }
  sheet.getRange("B7:F7").format.numberFormat = repeatFormat("0", 5);
  sheet.getRange("B6:F7").format.font = { color: "#008000" };
  sheet.getRange("B8:F10").format.font = { color: "#000000" };
  sheet.getRange("B11:F12").format.font = { color: "#008000" };
  sheet.getRange("A6:H12").format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
  sheet.getRange("A6:H12").format.wrapText = true;
  sheet.getRange("A6:H12").format.rowHeight = 30;
  sheet.getRange("A10:H10").format.fill = "#E2F0D9";
  sheet.getRange("A11:H11").format.fill = "#E2F0D9";

  sheet.mergeCells("A14:H14");
  setValues(sheet, "A14", [["POLICY AND CONTROL INTERPRETATION"]]);
  sheet.getRange("A14:H14").format.fill = "#1F4E78";
  sheet.getRange("A14:H14").format.font = { bold: true, color: "#FFFFFF" };

  const policyNotes = [
    "Buyer funds go to the smart contract or a regulated custody partner; they never route through a Blockmediary-controlled wallet.",
    "Client assets and matching liabilities are shown gross solely to size operational safeguarding, reconciliation and custody requirements.",
    "Client funds remain excluded from revenue, unrestricted cash, runway and the funding ask.",
    "No client-asset yield or spread is modelled without legal, regulatory and accounting approval; replace the 14-day hold with pilot telemetry."
  ];
  policyNotes.forEach((note, index) => {
    const row = 15 + index;
    sheet.mergeCells(`A${row}:H${row}`);
    setValues(sheet, `A${row}`, [[`${index + 1}. ${note}`]]);
    sheet.getRange(`A${row}:H${row}`).format.fill = index % 2 === 0 ? "#F2F6FA" : "#FFFFFF";
    sheet.getRange(`A${row}:H${row}`).format.wrapText = true;
    sheet.getRange(`A${row}:H${row}`).format.rowHeight = 30;
  });

  sheet.mergeCells("A20:H20");
  setValues(sheet, "A20", [["MEMORANDUM CHECKS"]]);
  sheet.getRange("A20:H20").format.fill = "#1F4E78";
  sheet.getRange("A20:H20").format.font = { bold: true, color: "#FFFFFF" };

  setValues(sheet, "A21:H22", [
    ["Client assets plus liability", null, null, null, null, null, "Expected: 0", "Checks the gross memorandum balances net to zero."],
    ["Operating cash availability", null, null, null, null, null, "Expected: 0", "Checks that none of the client assets are available to operations."]
  ]);
  sheet.getRange("B21:F21").copyFrom(pl.getRange("C9:G9"), "all");
  sheet.getRange("B22:F22").copyFrom(pl.getRange("C9:G9"), "all");
  setFormulas(sheet, "B21:F21", ["=B10", "=C10", "=D10", "=E10", "=F10"]);
  setFormulas(sheet, "B22:F22", ["=B11", "=C11", "=D11", "=E11", "=F11"]);
  sheet.getRange("B21:F22").format.numberFormat = currencyFormat;
  sheet.getRange("A21:H22").format.fill = "#E2F0D9";
  sheet.getRange("A21:H22").format.borders = { preset: "all", style: "thin", color: "#A9D18E" };
  sheet.getRange("A21:H22").format.wrapText = true;
  sheet.getRange("A21:H22").format.rowHeight = 28;

  sheet.getRange("A1:H22").format.font.name = "Arial";
  sheet.getRange("A1:H22").format.verticalAlignment = "center";
  sheet.getRange("A:A").format.columnWidth = 44;
  sheet.getRange("B:F").format.columnWidth = 21;
  sheet.getRange("G:G").format.columnWidth = 24;
  sheet.getRange("H:H").format.columnWidth = 62;
  sheet.getRange("H5:H22").format.wrapText = true;
  sheet.showGridlines = false;
}

function updateReadme() {
  const sheet = workbook.worksheets.getItem("README");
  setValues(sheet, "B77", [["Updated 11 August 2026. Detailed model uses 15 sheets, tier-specific deal values, a customer-retention bridge and a safeguarded client-funds memorandum."]]);

  sheet.getRange("B34:D34").copyFrom(sheet.getRange("B33:D33"), "all");
  setValues(sheet, "B34:D34", [[15, "Client_Funds_Memo", "Memorandum-only safeguarded client assets and matching liabilities; excluded from operating cash."]]);

  setValues(sheet, "B88", [["RESOLVED 11 AUGUST 2026 — MODEL MECHANICS"]]);
  setValues(sheet, "B89", [["[CLOSED 11 AUG 2026] Employer NI eligibility review removed from the open-issues list at management direction. No payroll formula change was made."]]);
  setValues(sheet, "B90", [["[RESOLVED 11 AUG 2026] Annual customer churn is 10% from Year 2. Because annual deal-volume inputs are net targets, churn raises gross new-customer acquisition required in the P&L customer bridge instead of applying a second revenue haircut. Replace with observed cohort retention when available."]]);
  setValues(sheet, "B91", [["[RESOLVED 11 AUG 2026] Client funds are shown gross on Client_Funds_Memo using a 14-day average holding period, with an equal client liability and zero operating-cash availability. They remain excluded from revenue, unrestricted cash, runway and funding ask."]]);
  sheet.getRange("B88:W88").format.fill = "#1F4E78";
  sheet.getRange("B88:W88").format.font = { bold: true, color: "#FFFFFF" };
  sheet.getRange("B89:W91").format.font = { color: "#008000" };
  sheet.getRange("B89:W91").format.wrapText = false;
  sheet.getRange("B89:W91").format.rowHeight = 20;
}

function addModelChecks() {
  const sheet = workbook.worksheets.getItem("Model_Checks");
  setFormula(sheet, "B4", '=IF(COUNTIF(F7:F29,"FAIL")>0,"FAIL","PASS")');

  const checks = [
    [26, "Churn assumption within planning range", "=IF(AND('Assumptions'!$F$178>=0,'Assumptions'!$F$178<=0.3),0,1)", "=0", 0, "Annual logo churn must remain between 0% and 30% for this planning model."],
    [27, "Customer retention bridge closes", "=ROUND(SUM(ABS('P&L_5yr'!C85),ABS('P&L_5yr'!D85),ABS('P&L_5yr'!E85),ABS('P&L_5yr'!F85),ABS('P&L_5yr'!G85)),6)", "=0", 0.000001, "Ending customers must equal target customers in every year."],
    [28, "Client-funds memorandum balances", "=ROUND(SUM(ABS('Client_Funds_Memo'!B10),ABS('Client_Funds_Memo'!C10),ABS('Client_Funds_Memo'!D10),ABS('Client_Funds_Memo'!E10),ABS('Client_Funds_Memo'!F10)),2)", "=0", 0.01, "Safeguarded client assets plus matching liabilities must net to zero."],
    [29, "Client funds excluded from operating cash", "=ROUND(SUM(ABS('Client_Funds_Memo'!B11),ABS('Client_Funds_Memo'!C11),ABS('Client_Funds_Memo'!D11),ABS('Client_Funds_Memo'!E11),ABS('Client_Funds_Memo'!F11))+ABS(SUM('Cash_Flow_Statement'!B18:BI18)),2)", "=0", 0.01, "Client funds and the cash-flow placeholder must contribute zero operating liquidity."]
  ];

  for (const [row, label, actual, expected, tolerance, note] of checks) {
    sheet.getRange(`A${row}:G${row}`).copyFrom(sheet.getRange("A25:G25"), "all");
    setValues(sheet, `A${row}:G${row}`, [[label, null, null, null, tolerance, null, note]]);
    setFormula(sheet, `B${row}`, actual);
    setFormula(sheet, `C${row}`, expected);
    setFormula(sheet, `D${row}`, `=B${row}-C${row}`);
    setFormula(sheet, `F${row}`, `=IF(ABS(D${row})<=E${row},"PASS","FAIL")`);
  }
}

addAssumptions();
addCustomerBridge();
updateSensitivity();
updateCashFlowLabel();
addClientFundsMemo();
updateReadme();
addModelChecks();

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`saved=${outputPath}`);
