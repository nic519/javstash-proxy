import { describe, expect, it } from 'vitest';
import { decodePublicCodeToken, encodePublicCodeToken } from '../lib/public-code-token';

describe('public code token', () => {
  it('round-trips a scene code into an alphabetic token', () => {
    const code = 'ABP-123';
    const token = encodePublicCodeToken(code);

    expect(token).not.toBe(code);
    expect(token).toMatch(/^[A-Za-z]+$/);
    expect(decodePublicCodeToken(token)).toBe(code);
  });

  it('removes separators and digits from the visible token shape', () => {
    const code = 'DASS-709';
    const token = encodePublicCodeToken(code);

    expect(token).toMatch(/^[A-Za-z]+$/);
    expect(token).not.toContain('-');
    expect(token).not.toMatch(/\d/);
    expect(decodePublicCodeToken(token)).toBe(code);
  });

  it('rejects malformed tokens that cannot be chunk-decoded', () => {
    expect(decodePublicCodeToken('abc')).toBeNull();
    expect(decodePublicCodeToken('ab!')).toBeNull();
  });
});
