// Signup validation rules. Pure functions, so they carry the same weight of
// testing as the escrow logic — a hole here is the front door of the product.
import { describe, it, expect } from 'vitest';
import { validateSignup, hasErrors, normaliseEmail, MIN_PASSWORD, type SignupInput } from './validate';

const VALID: SignupInput = {
  email: 'ops@solaris.example',
  password: 'correct horse 7',
  companyName: 'Solaris Textiles Co.',
  registrationNumber: '09876543',
  country: 'United Arab Emirates',
  addressLine1: 'Unit 4, Jebel Ali Free Zone',
  city: 'Dubai',
  postcode: '00000',
  contactName: 'Amina Rahman',
};

const errs = (over: Partial<SignupInput>) => validateSignup({ ...VALID, ...over });

describe('validateSignup — the happy case', () => {
  it('accepts a complete, well-formed signup', () => {
    expect(validateSignup(VALID)).toEqual({});
    expect(hasErrors(validateSignup(VALID))).toBe(false);
  });

  it('accepts without the optional fields', () => {
    const { registrationNumber, addressLine2, ...rest } = VALID;
    expect(validateSignup(rest)).toEqual({});
  });
});

describe('email', () => {
  it.each([
    ['missing', ''],
    ['no @', 'opssolaris.example'],
    ['no domain dot', 'ops@solaris'],
    ['spaces', 'ops @solaris.example'],
    ['nothing before @', '@solaris.example'],
  ])('rejects %s', (_label, email) => {
    expect(errs({ email }).email).toBeDefined();
  });

  it('accepts a plus-addressed email', () => {
    expect(errs({ email: 'ops+escrow@solaris.example' }).email).toBeUndefined();
  });
});

describe('password', () => {
  it(`rejects anything shorter than ${MIN_PASSWORD} characters`, () => {
    expect(errs({ password: 'Sh0rt' }).password).toContain(String(MIN_PASSWORD));
  });

  it('rejects a long string of only letters', () => {
    expect(errs({ password: 'aaaaaaaaaaaaaaa' }).password).toBeDefined();
  });

  it('rejects a long string of only digits', () => {
    expect(errs({ password: '1234567890123' }).password).toBeDefined();
  });

  it('accepts a long passphrase containing a digit', () => {
    expect(errs({ password: 'correct horse battery 9' }).password).toBeUndefined();
  });

  it('does not trim the password — spaces are legitimate characters', () => {
    // A passphrase's spaces must survive; only length and content are checked.
    expect(errs({ password: '  spaced out 12  ' }).password).toBeUndefined();
  });
});

describe('required company and contact fields', () => {
  it.each(['companyName', 'contactName', 'country', 'addressLine1', 'city', 'postcode'] as const)(
    'rejects a missing %s',
    (field) => {
      expect(errs({ [field]: '' })[field]).toBeDefined();
    },
  );

  it.each(['companyName', 'contactName', 'country', 'addressLine1', 'city', 'postcode'] as const)(
    'rejects a whitespace-only %s',
    (field) => {
      expect(errs({ [field]: '   ' })[field]).toBeDefined();
    },
  );

  it('reports every missing field at once, not just the first', () => {
    const e = validateSignup({});
    expect(Object.keys(e).sort()).toEqual(
      ['addressLine1', 'city', 'companyName', 'contactName', 'country', 'email', 'password', 'postcode'].sort(),
    );
  });
});

describe('normaliseEmail', () => {
  it('lowercases and trims so addresses match case-insensitively', () => {
    expect(normaliseEmail('  OPS@Solaris.Example  ')).toBe('ops@solaris.example');
  });
});
