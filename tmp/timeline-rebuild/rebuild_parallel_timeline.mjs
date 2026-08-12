import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = "C:/Users/cwbec/BlockMed/financial-projections/Blockmediary_Financial_Model_Detailed_2026-08-12.xlsx";
const workDir = "C:/Users/cwbec/BlockMed/tmp/timeline-rebuild";
const pass1Path = `${workDir}/pass1-parallel-timeline.xlsx`;
const finalPath = `${workDir}/Blockmediary_Financial_Model_Detailed_2026-08-12.parallel-timeline.xlsx`;
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));

function columnIndex(columnLetters) {
  let result = 0;
  for (const char of columnLetters) result = result * 26 + char.charCodeAt(0) - 64;
  return result - 1;
}

function columnName(oneBasedIndex) {
  let n = oneBasedIndex;
  let result = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function refreshFormulaCells(sheet, address) {
  const [startAddress] = address.split(":");
  const match = startAddress.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Unsupported range address: ${address}`);
  const startCol = columnIndex(match[1]);
  const startRow = Number(match[2]) - 1;
  const formulas = sheet.getRange(address).formulas;
  for (let r = 0; r < formulas.length; r += 1) {
    for (let c = 0; c < formulas[r].length; c += 1) {
      const formula = formulas[r][c];
      if (formula) {
        const cell = sheet.getCell(startRow + r, startCol + c);
        cell.clear({ applyTo: "contents" });
        cell.formulas = [[formula]];
      }
    }
  }
}

const launch = workbook.worksheets.getItem("Launch Readiness");

// PASS 1 — change timing inputs only. Project Month 0 maps to model Month 1.
launch.getRange("B11").values = [[1]];
launch.getRange("A20:I23").clear({ applyTo: "contents" });
launch.getRange("A20:I23").values = [
  ["Case", "Timing", "Latest pilot gate finish", "First paid pilot", "First receipt", "Full VARA licence target", "IDQ / pre-application start", "ATI / full submission target", "Planning interpretation"],
  [1, "Early", 8, null, null, 12, 1, 3, "Upside: complete application, limited rework and full licensing by Month 12."],
  [2, "Base", 11, null, null, 18, 1, 4, "Presentation base: paid DIFC-partner pilot Month 12; full VARA licence Month 18."],
  [3, "Delayed", 17, null, null, 24, 1, 6, "Sensitivity: classification, hiring, documentation or regulatory remediation delays."],
];
launch.getRange("D21:E23").formulas = [
  ["=C21+1", "=D21+$B$7"],
  ["=C22+1", "=D22+$B$7"],
  ["=C23+1", "=D23+$B$7"],
];
launch.getRange("E14").formulas = [["=INDEX($F$21:$F$23,$B$5)"]];
launch.getRange("G14").formulas = [["=INDEX($G$21:$G$23,$B$5)"]];
launch.getRange("H14:I15").clear({ applyTo: "contents" });
launch.getRange("C50:C53").formulas = [
  ["=MAX(B50,INDEX($C$21:$C$23,$B$5)-7)"],
  ["=MAX(B51,INDEX($C$21:$C$23,$B$5))"],
  ["=MAX(B52,INDEX($C$21:$C$23,$B$5)-1)"],
  ["=MAX(B53,INDEX($C$21:$C$23,$B$5)-1)"],
];
launch.getRange("E6").formulas = [["=MAX($C$50:$C$53)+1"]];

await fs.mkdir(workDir, { recursive: true });
const pass1 = await SpreadsheetFile.exportXlsx(workbook);
await pass1.save(pass1Path);

// PASS 2 — preserve assumptions, but add explicit timing controls and checks.
// The application fee remains a single Year-1 planning amount; annual supervision
// begins only at the full-licence target; restricted capital is funded one month prior.
launch.getRange("F15:H15").clear({ applyTo: "contents" });

const checks = workbook.worksheets.getItem("Model Checks");
checks.getRange("B4").formulas = [["=IF(COUNTIF(F7:F46,\"FAIL\")>0,\"FAIL\",\"PASS\")"]];
checks.getRange("F4").clear({ applyTo: "contents" });
checks.getRange("A32").values = [["Full VARA licence target month"]];
checks.getRange("C32").formulas = [["=18"]];
checks.getRange("G32").values = [["Base case implements the Month-18 full VARA licence target."]];
checks.getRange("C33").formulas = [["=MAX('Launch Readiness'!$C$50:$C$53)+1"]];
checks.getRange("B40").formulas = [["=ROUND(SUM(ABS('Launch Readiness'!B31-0),ABS('Launch Readiness'!C31-7),ABS('Launch Readiness'!D31-12),ABS('Launch Readiness'!E31-12),ABS('Launch Readiness'!F31-12)),0)"]];
checks.getRange("G40").values = [["Base timing must stage 0 / 7 / 12 / 12 / 12 VARA operating months."]];

for (const row of [44, 45, 46]) {
  checks.getRange(`A${row}:G${row}`).copyFrom(checks.getRange("A43:G43"), "all");
}
checks.getRange("A44:G46").values = [
  ["VARA IDQ start month", null, null, null, null, null, "Conceptual Month 0 is represented as model Month 1."],
  ["VARA full-submission target month", null, null, null, null, null, "Base planning milestone for ATI completion and the full VASP submission."],
  ["Parallel-route ordering", null, null, null, null, null, "IDQ starts at inception; full submission precedes licensing; the partner pilot may precede VARA licensing."],
];
checks.getRange("B44:F46").formulas = [
  ["='Launch Readiness'!$G$14", "=1", "=B44-C44", "=0", "=IF(ABS(D44)<=E44,\"PASS\",\"FAIL\")"],
  ["=INDEX('Launch Readiness'!$H$21:$H$23,'Launch Readiness'!$B$5)", "=4", "=B45-C45", "=0", "=IF(ABS(D45)<=E45,\"PASS\",\"FAIL\")"],
  ["=IF(AND('Launch Readiness'!$G$14=1,INDEX('Launch Readiness'!$H$21:$H$23,'Launch Readiness'!$B$5)>='Launch Readiness'!$G$14,'Launch Readiness'!$E$6<='Launch Readiness'!$E$14,'Launch Readiness'!$E$14>=INDEX('Launch Readiness'!$H$21:$H$23,'Launch Readiness'!$B$5)),0,1)", "=0", "=B46-C46", "=0", "=IF(ABS(D46)<=E46,\"PASS\",\"FAIL\")"],
];
checks.getRange("G18").values = [["Pilot one-off plus the VARA application fee equal the staged regulatory one-offs in the P&L."]];

// PASS 3 — align wording and presentation with two parallel workstreams.
launch.getRange("A1").values = [["LAUNCH READINESS — PARALLEL DIFC PILOT AND VARA LICENSING"]];
launch.getRange("A2").values = [["Planning model: both workstreams begin at project Month 0 (model Month 1). Base case targets a paid DIFC-partner pilot in Month 12 and full VARA licensing in Month 18; timing remains subject to counsel, partner and regulator confirmation."]];
launch.getRange("E5").values = [["Parallel DIFC-partner pilot + VARA licensing"]];
launch.getRange("A11").values = [["Partner-pilot preparation start month"]];
launch.getRange("D14").values = [["Full VARA licence target"]];
launch.getRange("F14").values = [["VARA IDQ start"]];
launch.getRange("D15").values = [["VARA application fee (Year 1)"]];
launch.getRange("D16").values = [["VARA supervision after full licensing"]];
launch.getRange("D17").values = [["VARA restricted capital before licensing"]];
launch.getRange("A19").values = [["TIMING CASES — PARALLEL DIFC PILOT AND VARA LICENSING"]];

// Extend the timing-case table using the existing local styles.
launch.getRange("I20:I23").copyFrom(launch.getRange("H20:H23"), "all");
launch.getRange("H20:H23").copyFrom(launch.getRange("G20:G23"), "all");
launch.getRange("A20:I23").values = [
  ["Case", "Timing", "Latest pilot gate finish", "First paid pilot", "First receipt", "Full VARA licence target", "IDQ / pre-application start", "ATI / full submission target", "Planning interpretation"],
  [1, "Early", 8, null, null, 12, 1, 3, "Upside: complete application, limited rework and full licensing by Month 12."],
  [2, "Base", 11, null, null, 18, 1, 4, "Presentation base: paid DIFC-partner pilot Month 12; full VARA licence Month 18."],
  [3, "Delayed", 17, null, null, 24, 1, 6, "Sensitivity: classification, hiring, documentation or regulatory remediation delays."],
];
launch.getRange("D21:E23").formulas = [
  ["=C21+1", "=D21+$B$7"],
  ["=C22+1", "=D22+$B$7"],
  ["=C23+1", "=D23+$B$7"],
];
launch.getRange("H1:H69").format.columnWidthPx = 132;
launch.getRange("I1:I69").format.columnWidthPx = 330;
for (const row of [1, 4, 19]) {
  launch.getRange(`I${row}`).copyFrom(launch.getRange(`H${row}`), "all");
}
launch.getRange("I20:I23").format.wrapText = true;
launch.getRange("A20:I23").format.rowHeight = 24;

launch.getRange("A50:E57").values = [
  ["Pilot perimeter and DIFC partner structure", 1, null, "Yes", "Counsel and partner confirm the permitted pilot structure, contract, token treatment, liability and limits."],
  ["Custody, settlement, contracts and go-live approval", 2, null, "Yes", "Responsibilities for funds, release controls, disputes, reporting and limited-pilot approval are agreed."],
  ["KYB, sanctions, monitoring and review SOPs", 1, null, "Yes", "Provider, escalation route, reviewer process and audit evidence are operational."],
  ["Production security, contract audit and API hardening", 2, null, "Yes", "Smart-contract audit, key controls, testing and partner API readiness are complete."],
  ["First paid DIFC-partner pilot", null, null, "Milestone", "Paid partner-led pilot begins independently of the VARA licence target."],
  ["VARA IDQ / pre-application begins", null, null, "No for pilot; yes for scale", "Parallel VARA track begins through DET or a non-DIFC Dubai free-zone commercial licensor."],
  ["ATI / full VASP submission target", null, null, "No for pilot; yes for scale", "Entity, governance, office, key-person and application materials advance toward full submission."],
  ["Full VARA licence target", null, null, "No for pilot; yes for scale", "No regulated VARA activity before full licensing; the target is a planning case, not a regulator service level."],
];
launch.getRange("C50:C53").formulas = [
  ["=MAX(B50,INDEX($C$21:$C$23,$B$5)-7)"],
  ["=MAX(B51,INDEX($C$21:$C$23,$B$5))"],
  ["=MAX(B52,INDEX($C$21:$C$23,$B$5)-1)"],
  ["=MAX(B53,INDEX($C$21:$C$23,$B$5)-1)"],
];
launch.getRange("B54:C57").formulas = [
  ["=$E$6", "=$E$6"],
  ["=$G$14", "=$G$14"],
  ["=$G$14", "=INDEX($H$21:$H$23,$B$5)"],
  ["=INDEX($H$21:$H$23,$B$5)", "=$E$14"],
];
launch.getRange("A50:E57").format.rowHeight = 28;
launch.getRange("A58:E59").clear({ applyTo: "contents" });

launch.getRange("A62").values = [["Parallel UAE launch route"]];
launch.getRange("C62").values = [["docs/Dubai_Fintech_License_Requirements.md; https://www.vara.ae/en/licenses-and-register/licence-applications/"]];
launch.getRange("F62").values = [["DIFC-partner pilot and VARA licensing begin together. VARA requires a DET or non-DIFC Dubai free-zone applicant; full licensing, not ATI, is the UAE-wide scale gate."]];

const readme = workbook.worksheets.getItem("README");
readme.getRange("A3:A64").clear({ applyTo: "contents" });
readme.getRange("B3").values = [["Programmable documentary escrow for SME cross-border trade. UAE launch-path and commercial refresh: 12 Aug 2026."]];
readme.getRange("D12").values = [["Parallel DIFC-partner pilot and VARA licensing milestones, fees and restricted capital."]];
readme.getRange("B47").values = [["3. Launch Readiness!B5 selects timing: 1=Early, 2=Base, 3=Delayed. DIFC-partner pilot and VARA licensing workstreams begin together at project Month 0 (model Month 1)."]];
readme.getRange("B48").values = [["4. Startup 6mo holds core pre-revenue build costs. Launch Readiness separately stages partner-pilot costs, the Year-1 VARA application fee, post-licence supervision and restricted capital."]];
readme.getRange("B60").values = [["• Base case: both workstreams start at project Month 0; paid DIFC-partner pilot Month 12; first receipt Month 13; full VARA licence target Month 18."]];
readme.getRange("B63").values = [["• Full VARA licensing—not ATI—is the UAE-wide scale gate; restricted capital is funded separately before licensing."]];

const dashboard = workbook.worksheets.getItem("Dashboard");
dashboard.getRange("B4").formulas = [["=\"The base case starts the DIFC-partner pilot and VARA licensing workstreams together, targeting the first paid pilot in Month \"&'Launch Readiness'!$E$6&\" and full VARA licensing in Month \"&'Launch Readiness'!$E$14&\".\""]];
dashboard.getRange("G12").formulas = [["=\"Parallel route: DIFC pilot M\"&'Launch Readiness'!$E$6&\"; VARA licence M\"&'Launch Readiness'!$E$14"]];
dashboard.getRange("O12").values = [["accepted commercial assumptions and parallel UAE launch timing"]];
dashboard.getRange("R28:U28").copyFrom(dashboard.getRange("R27:U27"), "all");
dashboard.getRange("R28").values = [[11]];
dashboard.getRange("S28").values = [["Full VARA licence target"]];
dashboard.getRange("T28").formulas = [["=\"Month \"&'Launch Readiness'!$E$14"]];
dashboard.getRange("U28").formulas = [["=\"Parallel work begins at project Month 0; full VARA licence base Month \"&'Launch Readiness'!$E$14&\" (early M\"&'Launch Readiness'!$F$21&\", delayed M\"&'Launch Readiness'!$F$23&\").\""]];

const cashFlow = workbook.worksheets.getItem("Cash Flow Statement");
cashFlow.getRange("A2").formulas = [["=\"Base case: DIFC-partner pilot and VARA application begin together; first paid pilot Month \"&'Launch Readiness'!$E$6&\", full VARA licence Month \"&'Launch Readiness'!$E$14&\"; future restricted capital remains separate.\""]];

const pnl = workbook.worksheets.getItem("P&L 5yr");
pnl.getRange("H51").values = [["Monthly base × complexity scale"]];
pnl.getRange("H52").values = [["MLRO support, security / resilience allowances, partner-pilot oversight and post-licence VARA supervision."]];
pnl.getRange("H57").clear({ applyTo: "contents" });
pnl.getRange("H58").values = [["Core startup spend, pilot onboarding and the Year-1 VARA application fee."]];
pnl.getRange("H90").values = [["Launch-date payroll plus fixed operating costs"]];
pnl.getRange("H91").values = [["Peak monthly operating deficit plus reserve; VARA restricted capital funded separately before licensing."]];

const sensitivity = workbook.worksheets.getItem("Sensitivity");
sensitivity.getRange("D18").values = [["Funding need is driven by the first paid pilot, the parallel VARA application, full-licence timing, peak monthly deficit and the selected unrestricted reserve."]];
sensitivity.getRange("H18").values = [["Change the timing case or reserve; compare the Month-12 / Month-18 / Month-24 full-licence cases."]];

const risk = workbook.worksheets.getItem("Risk Register");
risk.getRange("C14").values = [["LOW"]];
risk.getRange("C22").values = [["MEDIUM"]];
risk.getRange("D7").formulas = [["=\"The base case targets full VARA licensing in Month \"&'Launch Readiness'!$E$14&\" after a parallel application from inception. The required activity scope, capital and operating controls remain subject to counsel and regulator confirmation.\""]];
risk.getRange("D15").values = [["The initial operating raise and the pre-licence VARA restricted-capital call are modelled separately. Funding availability may not match the planned milestones."]];
risk.getRange("D23").formulas = [["=\"Base planning starts both workstreams together, with a paid DIFC-partner pilot in Month \"&'Launch Readiness'!$E$6&\" and full VARA licensing in Month \"&'Launch Readiness'!$E$14&\". Classification, hiring, documentation or regulator feedback may delay licensing and increase funding need.\""]];

const drivers = workbook.worksheets.getItem("Driver Tables");
drivers.getRange("H18").values = [["docs/Dubai_Fintech_License_Requirements.md; https://www.vara.ae/en/licenses-and-register/licence-applications/"]];
drivers.getRange("I18").values = [["DIFC-partner pilot and VARA licensing proceed in parallel; model Month 1 represents project Month 0."]];

const startup = workbook.worksheets.getItem("Startup 6mo");
startup.getRange("G17").values = [["DIFC-partner pilot and VARA licensing begin in parallel; custody/arranging scope remains an estimate pending UAE counsel."]];

const assumptions = workbook.worksheets.getItem("Assumptions");
assumptions.getRange("H185").values = [["UK development-cost assumptions; DIFC-partner pilot and VARA application begin in parallel, subject to counsel and regulator confirmation."]];

// Keep presentation formulas and calculations visually aligned with local styles.
launch.getRange("G14").format.numberFormat = "0 \"month\"";
launch.getRange("G21:H23").format.numberFormat = "0";
checks.getRange("A44:G46").format.rowHeight = 22;
checks.getRange("F44:F46").conditionalFormats.deleteAll();
checks.getRange("F44:F46").conditionalFormats.add("containsText", {
  text: "PASS",
  format: { fill: "#E2F0D9", font: { color: "#006100", bold: true } },
});
checks.getRange("F44:F46").conditionalFormats.add("containsText", {
  text: "FAIL",
  format: { fill: "#F4CCCC", font: { color: "#9C0006", bold: true } },
});
dashboard.getRange("R28:U28").format.rowHeight = 26;

// Re-express the key roll-forwards so imported cached values recalculate cleanly.
const monthColumns = Array.from({ length: 60 }, (_, index) => columnName(index + 2));
cashFlow.getRange("B19:BI19").formulas = [[...monthColumns.map((col) => `=ROUND(SUM(${col}14:${col}18),0)`)]];
cashFlow.getRange("B38:BI38").formulas = [[...monthColumns.map((col, index) => index === 0
  ? "=ROUND(SUM(B19,B23),0)"
  : `=ROUND(SUM(${monthColumns[index - 1]}38,${col}19,${col}23),0)`)]];

pnl.getRange("C64:G64").formulas = [[
  "=MAX(0,-MIN('Cash Flow Statement'!$B$38:$M$38))",
  "=MAX(0,-MIN('Cash Flow Statement'!$B$38:$Y$38))",
  "=MAX(0,-MIN('Cash Flow Statement'!$B$38:$AK$38))",
  "=MAX(0,-MIN('Cash Flow Statement'!$B$38:$AW$38))",
  "=MAX(0,-MIN('Cash Flow Statement'!$B$38:$BI$38))",
]];
const reserveFormula = "=ROUND(('Launch Readiness'!$B$6/12)*(INDEX($C$42:$G$42,1,MIN(5,ROUNDUP('Launch Readiness'!$E$6/12,0)))+INDEX($C$56:$G$56,1,MIN(5,ROUNDUP('Launch Readiness'!$E$6/12,0)))),0)";
pnl.getRange("C65:G65").formulas = [[reserveFormula, reserveFormula, reserveFormula, reserveFormula, reserveFormula]];
pnl.getRange("C66:G66").formulas = [[...Array.from({ length: 5 }, (_, index) => {
  const col = columnName(index + 3);
  return `=ROUND(SUM(${col}64:${col}65),0)`;
})]];
launch.getRange("E12").formulas = [["=ROUND(SUM(MAX('P&L 5yr'!$C$66:$G$66),$E$10),0)"]];
launch.getRange("E13").formulas = [["=ROUND(-AVERAGE('Cash Flow Statement'!$B$19:INDEX('Cash Flow Statement'!$B$19:$BI$19,1,MAX(1,$E$7))),0)"]];

cashFlow.getRange("B26:BI26").formulas = [[...monthColumns.map((col) =>
  `=ROUND(SUM(IF(${col}$8=1,IF(${col}$7=1,'P&L 5yr'!$C$66,MAX(0,INDEX('P&L 5yr'!$C$66:$G$66,1,${col}$7)-INDEX('P&L 5yr'!$C$66:$G$66,1,${col}$7-1))),0),IF(${col}$6=MAX(1,'Launch Readiness'!$E$6-1),'Launch Readiness'!$E$10,0),IF(${col}$6=MAX(1,'Launch Readiness'!$E$14-1),'Launch Readiness'!$E$17,0)),0)`
)]];
cashFlow.getRange("B27:BI27").formulas = [[...monthColumns.map((col) =>
  `=ROUND(-SUM(IF(${col}$6=MAX(1,'Launch Readiness'!$E$6-1),'Launch Readiness'!$E$10,0),IF(${col}$6=MAX(1,'Launch Readiness'!$E$14-1),'Launch Readiness'!$E$17,0)),0)`
)]];
cashFlow.getRange("B28:BI28").formulas = [[...monthColumns.map((col) => `=ROUND(${col}26+${col}27,0)`)]];
cashFlow.getRange("B31:BI31").formulas = [[...monthColumns.map((col, index) => index === 0 ? "=0" : `=ROUND(${monthColumns[index - 1]}33,0)`)]];
cashFlow.getRange("B32:BI32").formulas = [[...monthColumns.map((col) => `=ROUND(SUM(${col}19,${col}23,${col}28),0)`)]];
cashFlow.getRange("B33:BI33").formulas = [[...monthColumns.map((col) => `=ROUND(SUM(${col}31:${col}32),0)`)]];
cashFlow.getRange("B34:BI34").formulas = [[...monthColumns.map((col) => `=MAX(0,-ROUND(SUM($B$27:${col}$27),0))`)]];
cashFlow.getRange("B35:BI35").formulas = [[...monthColumns.map((col) => `=ROUND(SUM(${col}33:${col}34),0)`)]];

// Refresh remaining presentation and check formulas after the financial chain settles.
refreshFormulaCells(cashFlow, "B39:BI40");
const scenario = workbook.worksheets.getItem("Scenario Engine");
refreshFormulaCells(scenario, "B57:R60");
refreshFormulaCells(cashFlow, "B45:F58");
refreshFormulaCells(cashFlow, "B4:E4");
refreshFormulaCells(dashboard, "B4:U77");
refreshFormulaCells(checks, "B4:F46");

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(finalPath);
console.log(JSON.stringify({ pass1Path, finalPath }));
