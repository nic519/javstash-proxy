import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ItemCard } from '../components/shared/ItemCard';
import { sceneToTranslation } from '../components/shared/sceneToTranslation';
import { RemoteSceneResults } from '../components/shared/RemoteSceneResults';
import type { SceneData } from '../src/graphql/queries';

describe('sceneToTranslation', () => {
  it('maps scene data to translation fields used by browse and detail views', () => {
    const scene: SceneData = {
      id: 'scene-1',
      code: 'ABP-123',
      title: 'Original title',
      details: 'Original details',
      updated: '2026-04-03T10:00:00.000Z',
      images: [{ url: 'https://cdn.example.com/cover.jpg' }],
    };

    expect(sceneToTranslation(scene)).toEqual({
      code: 'ABP-123',
      titleZh: 'Original title',
      summaryZh: 'Original details',
      coverUrl: 'https://cdn.example.com/cover.jpg',
      rawResponse: JSON.stringify(scene),
      updatedAt: '2026-04-03T10:00:00.000Z',
    });
  });

  it('falls back to empty strings when title or details are missing', () => {
    const scene: SceneData = {
      id: 'scene-2',
      code: 'FSDSS-001',
    };

    expect(sceneToTranslation(scene)).toEqual({
      code: 'FSDSS-001',
      titleZh: '',
      summaryZh: '',
      coverUrl: undefined,
      rawResponse: JSON.stringify(scene),
      updatedAt: undefined,
    });
  });
});

describe('RemoteSceneResults', () => {
  it('treats whitespace-only keyword as initial state rather than no-results', () => {
    const markup = renderToStaticMarkup(
      createElement(RemoteSceneResults, {
        results: [],
        loading: false,
        error: '',
        keyword: '   ',
        onItemClick: () => {},
      })
    );

    expect(markup).toContain('开始搜索');
    expect(markup).not.toContain('未找到相关结果');
  });

  it('keeps existing results visible while loading a new search', () => {
    const markup = renderToStaticMarkup(
      createElement(RemoteSceneResults, {
        results: [
          {
            id: 'scene-3',
            code: 'ABP-123',
            title: 'Stale title',
            details: 'Stale details',
          },
        ],
        loading: true,
        error: '',
        keyword: 'new query',
        onItemClick: () => {},
      })
    );

    expect(markup).toContain('ABP-123');
    expect(markup).toContain('Stale title');
  });

  it('keeps existing results visible when an error banner is shown', () => {
    const markup = renderToStaticMarkup(
      createElement(RemoteSceneResults, {
        results: [
          {
            id: 'scene-4',
            code: 'PPPD-777',
            title: 'Visible title',
            details: 'Visible details',
          },
        ],
        loading: false,
        error: '请求失败，请重试',
        keyword: 'query',
        onItemClick: () => {},
      })
    );

    expect(markup).toContain('PPPD-777');
    expect(markup).toContain('Visible title');
    expect(markup).toContain('请求失败，请重试');
  });

  it('renders remote results as expanded detail cards with modal-level metadata', () => {
    const markup = renderToStaticMarkup(
      createElement(RemoteSceneResults, {
        results: [
          {
            id: 'scene-5',
            code: 'SSIS-777',
            title: 'Expanded title',
            details: 'Expanded details',
            date: 'invalid-date',
            director: '导演甲',
            studio: { name: '片商乙' },
            performers: [
              { performer: { name: '演员一' } },
              { performer: { name: '演员二' } },
            ],
            tags: [
              { id: '1', name: '剧情' },
              { id: '2', name: '制服' },
            ],
            images: [{ url: 'https://cdn.example.com/expanded-cover.jpg' }],
          },
        ],
        loading: false,
        error: '',
        keyword: 'expanded',
        onItemClick: () => {},
      })
    );

    expect(markup).toContain('SSIS-777');
    expect(markup).toContain('Expanded title');
    expect(markup).toContain('Expanded details');
    expect(markup).toContain('导演');
    expect(markup).toContain('导演甲');
    expect(markup).toContain('演员');
    expect(markup).toContain('演员一');
    expect(markup).toContain('演员二');
    expect(markup).toContain('片商乙');
    expect(markup).toContain('剧情');
    expect(markup).toContain('制服');
    expect(markup).toContain('expanded-cover.jpg');
  });

  it('renders local search results with the same expanded result card layout', () => {
    const markup = renderToStaticMarkup(
      createElement(RemoteSceneResults, {
        results: [],
        localResults: [
          {
            code: 'IPZZ-001',
            titleZh: 'Local expanded title',
            summaryZh: 'Local expanded summary',
            rawResponse: JSON.stringify({
              director: '本地导演',
              performers: [{ performer: { name: '本地演员' } }],
              tags: [{ name: '本地标签' }],
            }),
          },
        ],
        loading: false,
        error: '',
        keyword: 'local',
        source: 'local',
        onItemClick: () => {},
      })
    );

    expect(markup).toContain('IPZZ-001');
    expect(markup).toContain('Local expanded title');
    expect(markup).toContain('Local expanded summary');
    expect(markup).toContain('本地导演');
    expect(markup).toContain('本地演员');
    expect(markup).toContain('本地标签');
  });
});

describe('ItemCard', () => {
  it('renders the grid variant as a compact clickable card with a stable placeholder', () => {
    const markup = renderToStaticMarkup(
      createElement(ItemCard, {
        item: {
          code: 'ABP-123',
          titleZh: 'Grid title',
          summaryZh: '',
        },
        variant: 'grid',
        onClick: () => {},
      })
    );

    expect(markup).toContain('<button');
    expect(markup).toContain('Grid title');
    expect(markup).toContain('ABP-123');
    expect(markup).toContain('No Cover');
  });

  it('renders grid cover images anchored to the right during hover zoom', () => {
    const markup = renderToStaticMarkup(
      createElement(ItemCard, {
        item: {
          code: 'ABP-124',
          titleZh: 'Grid title with cover',
          summaryZh: '',
          coverUrl: 'https://cdn.example.com/grid-cover.jpg',
        },
        variant: 'grid',
        onClick: () => {},
      })
    );

    expect(markup).toContain('object-right');
    expect(markup).toContain('origin-right');
    expect(markup).toContain('grid-cover.jpg');
    expect(markup).not.toContain('No Cover');
  });

  it('keeps the cover height fixed while letting text content grow naturally inside an equal-height card', () => {
    const markup = renderToStaticMarkup(
      createElement(ItemCard, {
        item: {
          code: 'ABP-125',
          titleZh: 'A longer grid title that wraps to the next line',
          summaryZh: '',
          coverUrl: 'https://cdn.example.com/stretch-cover.jpg',
        },
        variant: 'grid',
        onClick: () => {},
      })
    );

    expect(markup).toContain('flex h-full flex-col');
    expect(markup).toContain('aspect-[2.8/4] w-full overflow-hidden');
    expect(markup).toContain('flex flex-1 flex-col p-3');
    expect(markup).toContain('text-sm font-medium line-clamp-3');
    expect(markup).not.toContain('min-h-[2.75rem]');
  });

  it('renders performer names from rawResponse on the grid variant', () => {
    const markup = renderToStaticMarkup(
      createElement(ItemCard, {
        item: {
          code: 'SSIS-001',
          titleZh: 'Performer title',
          summaryZh: '',
          rawResponse: JSON.stringify({
            performers: [
              { performer: { name: '河北彩花' } },
              { performer: { name: '葵司' } },
            ],
          }),
        },
        variant: 'grid',
        onClick: () => {},
      })
    );

    expect(markup).toContain('SSIS-001');
    expect(markup).toContain('河北彩花');
    expect(markup).toContain('葵司');
  });

  it('falls back to the original updatedAt string when formatting is invalid', () => {
    const markup = renderToStaticMarkup(
      createElement(ItemCard, {
        item: {
          code: 'ABP-123',
          titleZh: 'Card title',
          summaryZh: 'Summary',
          updatedAt: 'not-a-date',
        },
        variant: 'card',
        onClick: () => {},
      })
    );

    expect(markup).toContain('not-a-date');
  });

  it('renders clickable card variants with button-like semantics', () => {
    const markup = renderToStaticMarkup(
      createElement('table', null,
        createElement('tbody', null,
          createElement(ItemCard, {
            item: {
              code: 'ABP-123',
              titleZh: 'Accessible title',
              summaryZh: 'Summary',
            },
            variant: 'table',
            onClick: () => {},
          })
        )
      )
    );

    expect(markup).toContain('<button');
    expect(markup).toContain('aria-label');
    expect(markup).toContain('sr-only');
  });
});
