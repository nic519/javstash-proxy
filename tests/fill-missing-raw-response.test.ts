import { describe, expect, it } from 'vitest';
import {
  extractCoverUrlFromScene,
  isBadCoverUrl,
  isMissingRawResponse,
  selectSceneForCode,
} from '../scripts/fill-missing-raw-response.mjs';

describe('isMissingRawResponse', () => {
  it('matches null, undefined, and empty raw_response values', () => {
    expect(isMissingRawResponse({ raw_response: null })).toBe(true);
    expect(isMissingRawResponse({ raw_response: '' })).toBe(true);
    expect(isMissingRawResponse({ raw_response: '   ' })).toBe(true);
    expect(isMissingRawResponse({ raw_response: '{"code":"REAL-358"}' })).toBe(false);
  });
});

describe('selectSceneForCode', () => {
  it('prefers the exact matching code from search results', () => {
    expect(
      selectSceneForCode('REAL-358', [
        { code: 'REAL-357' },
        { code: 'REAL-358', id: 'match' },
        { code: 'REAL-359' },
      ])
    ).toEqual({ code: 'REAL-358', id: 'match' });
  });

  it('falls back to the first scene when there is no exact code match', () => {
    expect(
      selectSceneForCode('REAL-358', [
        { code: 'REAL-999', id: 'first' },
        { code: 'REAL-888', id: 'second' },
      ])
    ).toEqual({ code: 'REAL-999', id: 'first' });
  });
});

describe('extractCoverUrlFromScene', () => {
  it('returns the first non-empty image url', () => {
    expect(
      extractCoverUrlFromScene({
        images: [
          { url: '  ' },
          { url: 'https://javstash.org/images/real-358.jpg' },
        ],
      })
    ).toBe('https://javstash.org/images/real-358.jpg');
  });
});

describe('isBadCoverUrl', () => {
  it('detects internal 192-prefixed cover urls', () => {
    expect(isBadCoverUrl('http://192.168.7.171:9999/scene/1/screenshot')).toBe(true);
    expect(isBadCoverUrl('https://javstash.org/images/cover.jpg')).toBe(false);
  });
});
