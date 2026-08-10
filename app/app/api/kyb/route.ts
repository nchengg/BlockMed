import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAccount } from "@/lib/auth/session";
import { isControlCondition, isKybComplete, kybGaps, passportExpired } from "@/lib/kyb/psc";

// Read and update a company's KYB record (docs/document-templates.md DOC-15/17/18/19).
//
// PROOF OF CONCEPT — everything here is the user's own declaration. There is no
// reviewer, no registry lookup, no sanctions screening. Completing the form sets
// kybStatus to "attested", which means "the company said so", never "verified".
//
// Authorisation is the session's own account only: a company edits its own KYB
// record and nobody else's, so there is no account id in the request body.

const dateOrNull = (v: unknown): Date | null => {
  if (typeof v !== "string" || !v.trim()) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const textOrNull = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

export async function GET() {
  const account = await getSessionAccount();
  if (!account) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  const full = await prisma.account.findUnique({
    where: { id: account.id },
    include: { peopleOfControl: { orderBy: { createdAt: "asc" } } },
  });
  if (!full) return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });

  const { passwordHash: _omit, ...safe } = full;
  return NextResponse.json({
    ok: true,
    account: safe,
    gaps: kybGaps(full, full.peopleOfControl.length),
    passportExpired: passportExpired(full.signatoryPassportExpiry),
  });
}

export async function POST(req: Request) {
  const account = await getSessionAccount();
  if (!account) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // People of control are replaced wholesale rather than patched: the form edits
  // the whole set, and a partial update would silently leave a removed owner on
  // the record — the opposite of what the user asked for.
  const rawPeople = Array.isArray(body.peopleOfControl) ? body.peopleOfControl : null;
  const people =
    rawPeople?.map(p => p as Record<string, unknown>).filter(p => textOrNull(p.fullName)) ?? null;

  if (people) {
    for (const p of people) {
      if (!isControlCondition(p.controlCondition)) {
        return NextResponse.json(
          { ok: false, error: "Each person of control needs one of the five statutory conditions." },
          { status: 400 },
        );
      }
    }
  }

  const data = {
    registrationNumber: textOrNull(body.registrationNumber) ?? "",
    companyType: textOrNull(body.companyType),
    jurisdiction: textOrNull(body.jurisdiction),
    issuingAuthority: textOrNull(body.issuingAuthority),
    incorporationDate: dateOrNull(body.incorporationDate),
    signatoryName: textOrNull(body.signatoryName),
    signatoryNationality: textOrNull(body.signatoryNationality),
    signatoryDob: dateOrNull(body.signatoryDob),
    signatoryPassportExpiry: dateOrNull(body.signatoryPassportExpiry),
    fundsSourceNature: textOrNull(body.fundsSourceNature),
    fundsSourceCountry: textOrNull(body.fundsSourceCountry),
    declaredNotCriminalFunds: body.declaredNotCriminalFunds === true,
    declaredNoSanctions: body.declaredNoSanctions === true,
  };

  const pscCount = people?.length ?? (await prisma.personOfControl.count({ where: { accountId: account.id } }));
  const complete = isKybComplete(data, pscCount);

  // declarationsAt records WHEN the company affirmed the AML declarations, which
  // is the fact an audit would ask for — not merely that a box is ticked now.
  const declarationsAt =
    data.declaredNotCriminalFunds && data.declaredNoSanctions ? new Date() : null;

  await prisma.$transaction(async tx => {
    await tx.account.update({
      where: { id: account.id },
      data: { ...data, declarationsAt, kybStatus: complete ? "attested" : "incomplete" },
    });
    if (people) {
      await tx.personOfControl.deleteMany({ where: { accountId: account.id } });
      for (const p of people) {
        await tx.personOfControl.create({
          data: {
            accountId: account.id,
            fullName: String(p.fullName).trim(),
            nationality: textOrNull(p.nationality) ?? "",
            birthMonthYear: textOrNull(p.birthMonthYear) ?? "",
            countryOfResidence: textOrNull(p.countryOfResidence) ?? "",
            controlCondition: String(p.controlCondition),
            controlDetail: textOrNull(p.controlDetail),
          },
        });
      }
    }
  });

  return NextResponse.json({
    ok: true,
    kybStatus: complete ? "attested" : "incomplete",
    gaps: kybGaps(data, pscCount),
    passportExpired: passportExpired(data.signatoryPassportExpiry),
  });
}
