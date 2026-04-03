import { describe, expect, it } from 'vitest';
import {
  extractCoverUrlFromRawResponse,
  extractCoverUrlFromScene,
  isBadCoverUrl,
} from '../src/cover-url';

describe('isBadCoverUrl', () => {
  it('matches only 192-prefixed internal cover urls', () => {
    expect(isBadCoverUrl('http://192.168.1.10/a.jpg')).toBe(true);
    expect(isBadCoverUrl('https://javstash.org/images/a.jpg')).toBe(false);
    expect(isBadCoverUrl(undefined)).toBe(false);
  });
});

describe('extractCoverUrlFromScene', () => {
  it('returns the first non-empty image url', () => {
    expect(
      extractCoverUrlFromScene({
        images: [
          { url: ' ' },
          { url: 'https://javstash.org/images/cover.jpg' },
          { url: 'https://javstash.org/images/cover-2.jpg' },
        ],
      })
    ).toBe('https://javstash.org/images/cover.jpg');
  });
});

describe('extractCoverUrlFromRawResponse', () => {
  it('parses a scene object and extracts its first image url', () => {
    expect(
      extractCoverUrlFromRawResponse(
        JSON.stringify({
          code: 'REAL-358',
          images: [{ url: 'https://javstash.org/images/real-358.jpg' }],
        })
      )
    ).toBe('https://javstash.org/images/real-358.jpg');
  });

  it('returns undefined for invalid payloads or legacy arrays', () => {
    expect(extractCoverUrlFromRawResponse('')).toBeUndefined();
    expect(extractCoverUrlFromRawResponse('not-json')).toBeUndefined();
    expect(extractCoverUrlFromRawResponse(JSON.stringify([]))).toBeUndefined();
  });
});
