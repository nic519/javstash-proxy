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
