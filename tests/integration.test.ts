import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all external dependencies
vi.mock('@libsql/client', () => ({
  createClient: () => ({
    execute: vi.fn(async () => ({ rows: [] })),
    batch: vi.fn(async () => []),
  }),
}));

vi.mock('@libsql/client/web', () => ({
  createClient: () => ({
    execute: vi.fn(async () => ({ rows: [] })),
    batch: vi.fn(async () => []),
  }),
}));

// Mock the global fetch function to simulate successful responses
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation(
    (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      if (url.includes('javstash.org/graphql')) {
        // Mock javstash response
        return Promise.resolve(
          new Response(JSON.stringify({
            data: {
              searchScene: [
                {
                  code: 'SSIS-001',
                  title: '日本語タイトル',
                  details: '日本語詳細',
                  studio: { name: 'S1' },
                },
              ],
            },
          }))
        );
      }

      if (url.includes('deeplx.local')) {
        // Mock DeepLX response
        return Promise.resolve(
          new Response(JSON.stringify({
            code: 200,
            data: '中文标题\n🔷🔸🔷\n中文简介',
          }))
        );
      }

      return Promise.resolve(new Response(JSON.stringify({})));
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Integration: Full Request Flow', () => {
  it('should process searchScene query end-to-end', async () => {
    // Import after mocking
    const { handleGraphQLRequest } = await import('../src/handler.js');

    // Set environment variables
    process.env.JAVSTASH_API_KEY = 'test-key';
    process.env.TURSO_URL = 'http://localhost';
    process.env.TURSO_AUTH_TOKEN = 'test-token';
    process.env.DEEPLX_API_URL = 'http://deeplx.local';

    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query($term: String!) { searchScene(term: $term) { title details code } }',
        variables: { term: 'SSIS-001' },
      }),
    });

    const response = await handleGraphQLRequest(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.searchScene[0].title).toBe('中文标题');
    expect(data.data.searchScene[0].details).toBe('中文简介');
  });

  it('serves browser lookup requests end-to-end', async () => {
    const { GET } = await import('../app/api/browser/lookup/route');

    process.env.TURSO_URL = 'http://localhost';
    process.env.TURSO_AUTH_TOKEN = 'test-token';
    process.env.DEEPLX_API_URL = 'http://deeplx.local';

    const response = await GET(
      new NextRequest('http://localhost/api/browser/lookup?code=SSIS-001', {
        headers: { 'x-javstash-api-key': 'user-key' },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      ok: true,
      code: 'SSIS-001',
      title: '中文标题',
      description: '中文简介',
      translated: true,
      source: 'javstash-proxy',
    });
  });
});
