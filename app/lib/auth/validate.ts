// Signup validation — pure, so it can be unit-tested and reused by the client
// for inline feedback without duplicating the rules.
//
// The company fields exist because this is a trade-finance product: KYB/KYC
// screening (FR-7) is a hard gate before funding in the full product, and it
// needs exactly this identity data. Capturing it at signup means the form does
// not have to be redesigned when screening is wired in.

export type SignupInput = {
  email: string;
  password: string;
  companyName: string;
  registrationNumber?: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  contactName: string;
};

/** field name → message. Empty object means valid. */
export type FieldErrors = Partial<Record<keyof SignupInput, string>>;

// Deliberately permissive: one @, something either side, a dot in the domain.
// Real deliverability is proven by sending mail, not by a clever regex.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD = 10;

export function validateSignup(input: Partial<SignupInput>): FieldErrors {
  const e: FieldErrors = {};
  const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  if (!EMAIL.test(t(input.email))) e.email = 'Enter a valid email address.';

  const pw = typeof input.password === 'string' ? input.password : '';
  if (pw.length < MIN_PASSWORD) {
    e.password = `Use at least ${MIN_PASSWORD} characters.`;
  } else if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    // Length does most of the work; this just rules out "aaaaaaaaaa".
    e.password = 'Include at least one letter and one number.';
  }

  if (!t(input.companyName)) e.companyName = 'Enter the company legal name.';
  if (!t(input.contactName)) e.contactName = 'Enter a contact name.';
  if (!t(input.country)) e.country = 'Enter a country.';
  if (!t(input.addressLine1)) e.addressLine1 = 'Enter the address.';
  if (!t(input.city)) e.city = 'Enter a city.';
  if (!t(input.postcode)) e.postcode = 'Enter a postcode.';

  return e;
}

export function hasErrors(e: FieldErrors): boolean {
  return Object.keys(e).length > 0;
}

/** Normalise before storing: emails are matched case-insensitively. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
