import { describe, expect, it } from 'vitest';
import {
  extractCoverUrlFromRawResponse,
  shouldFixCoverUrl,
} from '../scripts/fix-cover-urls.mjs';

describe('extractCoverUrlFromRawResponse', () => {
  it('returns the first non-empty image url from scene raw_response', () => {
    expect(
      extractCoverUrlFromRawResponse(
        JSON.stringify({
          code: 'REAL-358',
          images: [
            { url: '   ' },
            { url: 'https://cdn.example.com/real-358.jpg' },
            { url: 'https://cdn.example.com/real-358-2.jpg' },
          ],
        })
      )
    ).toBe('https://cdn.example.com/real-358.jpg');
  });

  it('returns null for invalid, empty, or legacy array payloads', () => {
    expect(extractCoverUrlFromRawResponse('')).toBeNull();
    expect(extractCoverUrlFromRawResponse('not-json')).toBeNull();
    expect(extractCoverUrlFromRawResponse(JSON.stringify([]))).toBeNull();
    expect(extractCoverUrlFromRawResponse(JSON.stringify({ images: [] }))).toBeNull();
  });
});

describe('shouldFixCoverUrl', () => {
  it('matches only rows with a bad 192-prefixed cover_url and non-empty raw_response', () => {
    expect(
      shouldFixCoverUrl({
        code: 'REAL-358',
        cover_url: 'http://192.168.1.10/images/real-358.jpg',
        raw_response: '{"images":[{"url":"https://cdn.example.com/real-358.jpg"}]}',
      })
    ).toBe(true);

    expect(
      shouldFixCoverUrl({
        code: 'REAL-359',
        cover_url: 'https://cdn.example.com/real-359.jpg',
        raw_response: '{"images":[{"url":"https://cdn.example.com/real-359.jpg"}]}',
      })
    ).toBe(false);

    expect(
      shouldFixCoverUrl({
        code: 'REAL-360',
        cover_url: 'http://192.168.1.20/images/real-360.jpg',
        raw_response: '',
      })
    ).toBe(false);
  });
});
