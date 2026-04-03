import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SEARCH_SCENE_QUERY, type SceneData } from '../src/graphql/queries';
import {
  AdminSearchResultsOverlay,
  fetchAdminLocalSearchResults,
  fetchAdminRemoteSearchResults,
  resolveAdminSearchResults,
  shouldApplyAdminSearchResponse,
} from '../app/admin/_components/AdminSearchResultsOverlay';

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

describe('fetchAdminLocalSearchResults', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queries the admin translations endpoint with the trimmed search term', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              code: 'ABP-123',
              titleZh: 'Local title',
              summaryZh: 'Local summary',
            },
          ],
        })
      )
    );

    const result = await fetchAdminLocalSearchResults('  ABP-123  ');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/translations?page=1&pageSize=20&sortBy=updated&search=ABP-123'
    );
    expect(result).toEqual([
      {
        code: 'ABP-123',
        titleZh: 'Local title',
        summaryZh: 'Local summary',
      },
    ]);
  });

  it('short-circuits for an empty trimmed term', async () => {
    const result = await fetchAdminLocalSearchResults('   ');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

describe('shouldApplyAdminSearchResponse', () => {
  it('only accepts the latest local admin search response version', () => {
    expect(shouldApplyAdminSearchResponse({ requestId: 2, activeRequestId: 3 })).toBe(false);
    expect(shouldApplyAdminSearchResponse({ requestId: 3, activeRequestId: 3 })).toBe(true);
  });
});

describe('resolveAdminSearchResults', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty local state when the keyword is blank', async () => {
    const result = await resolveAdminSearchResults('   ');

    expect(result).toEqual({
      source: null,
      localResults: [],
      results: [],
      error: '',
    });
  });

  it('stays on local results when local search hits', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [{ code: 'ABP-123', titleZh: 'Local title', summaryZh: 'Local summary' }],
        })
      )
    );

    const result = await resolveAdminSearchResults('ABP-123');

    expect(result).toEqual({
      source: 'local',
      localResults: [{ code: 'ABP-123', titleZh: 'Local title', summaryZh: 'Local summary' }],
      results: [],
      error: '',
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to remote results when local search misses', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              searchScene: [{ id: 'scene-1', code: 'ABP-123', title: 'Remote title' }],
            },
          })
        )
      );

    const result = await resolveAdminSearchResults('ABP-123');

    expect(result).toEqual({
      source: 'remote',
      localResults: [],
      results: [{ id: 'scene-1', code: 'ABP-123', title: 'Remote title' }],
      error: '',
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('AdminSearchResultsOverlay', () => {
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
      createElement(AdminSearchResultsOverlay, {
        open: true,
        keyword: 'ABP-123',
        source: 'remote',
        localResults: [],
        results,
        loading: false,
        error: '',
        onClose: () => {},
        onLocalSelect: () => {},
        onRemoteSelect: () => {},
      })
    );

    expect(markup).toContain('Javstash 搜索结果');
    expect(markup).toContain('本地未命中');
    expect(markup).toContain('Remote title');
    expect(markup).toContain('aria-label="关闭搜索结果弹层"');
    expect(markup).toContain('data-result-display="overlay-list"');
    expect(markup).not.toContain('<table');
  });

  it('renders local search results without changing the admin body list contract', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminSearchResultsOverlay, {
        open: true,
        keyword: 'ABP-123',
        source: 'local',
        localResults: [
          {
            code: 'ABP-123',
            titleZh: 'Local title',
            summaryZh: 'Local summary',
            rawResponse: JSON.stringify({
              director: '本地导演',
              performers: [{ performer: { name: '本地演员' } }],
              tags: [{ name: '本地标签' }],
              studio: { name: '本地片商' },
            }),
          },
        ],
        results: [],
        loading: false,
        error: '',
        onClose: () => {},
        onLocalSelect: () => {},
        onRemoteSelect: () => {},
      })
    );

    expect(markup).toContain('本地搜索结果');
    expect(markup).toContain('Local title');
    expect(markup).toContain('本地导演');
    expect(markup).toContain('本地演员');
    expect(markup).toContain('本地标签');
    expect(markup).toContain('data-result-display="overlay-list"');
    expect(markup).not.toContain('本地未命中');
    expect(markup).not.toContain('<table');
  });

  it('uses divider-based overlay list styling instead of bordered result cards', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminSearchResultsOverlay, {
        open: true,
        keyword: 'ABP',
        source: 'remote',
        localResults: [],
        results: [
          ...results,
          {
            id: 'scene-2',
            code: 'ABP-124',
            title: 'Remote title 2',
            details: 'Remote summary 2',
            images: [{ url: 'https://example.com/cover-2.jpg' }],
          },
        ],
        loading: false,
        error: '',
        onClose: () => {},
        onLocalSelect: () => {},
        onRemoteSelect: () => {},
      })
    );

    expect(markup).toContain('data-result-display="overlay-list"');
    expect(markup).toContain('divide-y');
    expect(markup).toContain('data-result-item-style="overlay-list-item"');
    expect(markup).not.toContain('data-result-item-style="card"');
    expect(markup).not.toContain('background:rgba(255,255,255,0.02)');
  });

  it('returns no markup when the modal is closed', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminSearchResultsOverlay, {
        open: false,
        keyword: 'ABP-123',
        source: null,
        localResults: [],
        results,
        loading: false,
        error: '',
        onClose: () => {},
        onLocalSelect: () => {},
        onRemoteSelect: () => {},
      })
    );

    expect(markup).toBe('');
  });
});
