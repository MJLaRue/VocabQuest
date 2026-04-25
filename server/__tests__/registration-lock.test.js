/**
 * Tests for registration lock logic.
 * Mirrors the pure functions used in server/routes/auth.js.
 * No DB connection required.
 */
import { describe, it, expect } from 'vitest';

// Mirrors auth.js: read setting row → boolean
function isRegistrationOpen(settingValue) {
  if (settingValue == null) return true; // missing row = open (fail-safe)
  return settingValue !== 'false';
}

// Mirrors auth.js: should this request be allowed through?
function canRegister(existingUser, registrationOpen) {
  // Pre-registered user (exists, no password) completing setup → always allowed
  if (existingUser && !existingUser.password) return true;
  return registrationOpen;
}

describe('isRegistrationOpen', () => {
  it('returns true when value is "true"', () => {
    expect(isRegistrationOpen('true')).toBe(true);
  });

  it('returns false when value is "false"', () => {
    expect(isRegistrationOpen('false')).toBe(false);
  });

  it('returns true when setting row is missing (fail-safe default)', () => {
    expect(isRegistrationOpen(null)).toBe(true);
    expect(isRegistrationOpen(undefined)).toBe(true);
  });
});

describe('canRegister', () => {
  it('allows new user when registration is open', () => {
    expect(canRegister(null, true)).toBe(true);
  });

  it('blocks new user when registration is closed', () => {
    expect(canRegister(null, false)).toBe(false);
  });

  it('always allows pre-registered user (no password) regardless of lock', () => {
    expect(canRegister({ password: null }, false)).toBe(true);
    expect(canRegister({ password: null }, true)).toBe(true);
  });

  it('blocks existing user with password when registration is closed', () => {
    expect(canRegister({ password: 'hash' }, false)).toBe(false);
  });
});
