import { describe, expect, it } from 'vitest';
import { decodePublicCodeToken, encodePublicCodeToken } from '../lib/public-code-token';

describe('public code token', () => {
  it('round-trips a scene code without changing its visible length', () => {
    const code = 'ABP-123';
    const token = encodePublicCodeToken(code);

    expect(token).not.toBe(code);
    expect(token).toHaveLength(code.length);
    expect(decodePublicCodeToken(token)).toBe(code);
  });

  it('keeps separators in place while obfuscating supported characters', () => {
    const code = 'SSIS-001';
    const token = encodePublicCodeToken(code);

    expect(token[4]).toBe('-');
    expect(token).toMatch(/^[A-Z0-9-]+$/);
    expect(decodePublicCodeToken(token)).toBe(code);
  });
});
