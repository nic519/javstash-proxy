import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SEARCH_SCENE_QUERY, type SceneData } from '../src/graphql/queries';
import {
  AdminRemoteSearchModal,
  fetchAdminRemoteSearchResults,
  shouldApplyAdminSearchResponse,
} from '../app/admin/_components/AdminRemoteSearchModal';

describe('fetchAdminRemoteSearchResults', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the shared scene search query to /api/graphql for admin fallback results', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            searchScene: [
              {
                id: 'scene-1',
                code: 'ABP-123',
                title: 'Remote title',
                details: 'Remote summary',
              },
            ],
          },
        })
      )
    );

    const result = await fetchAdminRemoteSearchResults('ABP-123');

    expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_SCENE_QUERY,
        variables: { term: 'ABP-123' },
      }),
    });
    expect(result).toEqual({
      results: [
        {
          id: 'scene-1',
          code: 'ABP-123',
          title: 'Remote title',
          details: 'Remote summary',
        },
      ],
      error: '',
    });
  });

  it('short-circuits for an empty trimmed term', async () => {
    const result = await fetchAdminRemoteSearchResults('   ');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toEqual({
      results: [],
      error: '',
    });
  });

  it('surfaces graphql errors from a successful response body', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [{ message: 'GraphQL exploded' }],
        })
      )
    );

    const result = await fetchAdminRemoteSearchResults('ABP-123');

    expect(result).toEqual({
      results: [],
      error: 'GraphQL exploded',
    });
  });

  it('surfaces non-ok response errors', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad gateway' }), {
        status: 502,
      })
    );

    const result = await fetchAdminRemoteSearchResults('ABP-123');

    expect(result).toEqual({
      results: [],
      error: 'Bad gateway',
    });
  });

  it('handles thrown network failures', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('socket hang up'));

    const result = await fetchAdminRemoteSearchResults('ABP-123');

    expect(result).toEqual({
      results: [],
      error: '请求失败，请重试',
    });
  });
});

describe('shouldApplyAdminSearchResponse', () => {
  it('only accepts the latest local admin search response version', () => {
    expect(shouldApplyAdminSearchResponse({ requestId: 2, activeRequestId: 3 })).toBe(false);
    expect(shouldApplyAdminSearchResponse({ requestId: 3, activeRequestId: 3 })).toBe(true);
  });
});

describe('AdminRemoteSearchModal', () => {
  const results: SceneData[] = [
    {
      id: 'scene-1',
      code: 'ABP-123',
      title: 'Remote title',
      details: 'Remote summary',
      images: [{ url: 'https://example.com/cover.jpg' }],
    },
  ];

  it('renders the admin fallback shell and shared remote results when open', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminRemoteSearchModal, {
        open: true,
        keyword: 'ABP-123',
        results,
        loading: false,
        error: '',
        onClose: () => {},
        onSelect: () => {},
      })
    );

    expect(markup).toContain('Javstash 搜索结果');
    expect(markup).toContain('本地未命中');
    expect(markup).toContain('Remote title');
    expect(markup).not.toContain('<table');
  });

  it('returns no markup when the modal is closed', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminRemoteSearchModal, {
        open: false,
        keyword: 'ABP-123',
        results,
        loading: false,
        error: '',
        onClose: () => {},
        onSelect: () => {},
      })
    );

    expect(markup).toBe('');
  });
});
