import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth/session';
import { validateSignup, hasErrors, normaliseEmail, type SignupInput } from '@/lib/auth/validate';

// Create a trading company account and sign it straight in.
//
// Wallets are deliberately not part of signup: the model is account-first,
// wallet-second (the BRD's all-party-roles decision means a platform or
// intermediary may never have one). Linking a proven wallet is a later step.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<SignupInput>;

  const errors = validateSignup(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const email = normaliseEmail(body.email!);
  const existing = await prisma.account.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    // Specific here, unlike login: the address is already discoverable by
    // trying to register it, and a vague error would just confuse the user.
    return NextResponse.json(
      { ok: false, errors: { email: 'An account with that email already exists — sign in instead.' } },
      { status: 409 },
    );
  }

  const account = await prisma.account.create({
    data: {
      email,
      passwordHash: await hashPassword(body.password!),
      companyName: body.companyName!.trim(),
      registrationNumber: body.registrationNumber?.trim() || null,
      country: body.country!.trim(),
      addressLine1: body.addressLine1!.trim(),
      addressLine2: body.addressLine2?.trim() || null,
      city: body.city!.trim(),
      postcode: body.postcode!.trim(),
      contactName: body.contactName!.trim(),
    },
    select: { id: true, email: true, companyName: true, contactName: true, country: true, type: true },
  });

  await createSession(account.id);
  return NextResponse.json({ ok: true, account }, { status: 201 });
}
