import { describe, expect, it } from 'vitest';
import type { SceneData } from '../src/graphql/queries';
import {
  getPerformerNames,
  getTagColor,
  mergeHydratedTranslation,
} from '../components/shared/detail-modal/helpers';

describe('getPerformerNames', () => {
  it('returns only non-empty performer names in order', () => {
    const rawData: SceneData = {
      id: 'scene-1',
      code: 'ABP-123',
      performers: [
        { performer: { name: 'Alice' } },
        { performer: { name: '  ' } },
        { performer: {} },
        {},
        { performer: { name: 'Bob' } },
      ],
    };

    expect(getPerformerNames(rawData)).toEqual(['Alice', 'Bob']);
  });

  it('returns an empty array when performer data is unavailable', () => {
    expect(getPerformerNames(null)).toEqual([]);
    expect(
      getPerformerNames({
        id: 'scene-2',
        code: 'ABP-456',
      })
    ).toEqual([]);
  });
});

describe('getTagColor', () => {
  it('returns a stable color for the same tag name', () => {
    expect(getTagColor('剧情')).toEqual(getTagColor('剧情'));
    expect(getTagColor('女教师')).toEqual(getTagColor('女教师'));
  });

  it('spreads different tag names across the palette', () => {
    const paletteEntries = new Set(
      ['剧情', '秘书', '户外', '人妻', '学生', '制服', '巨乳', '恋爱', '办公室', '出差'].map((tag) =>
        JSON.stringify(getTagColor(tag))
      )
    );

    expect(paletteEntries.size).toBeGreaterThan(1);
  });
});

describe('mergeHydratedTranslation', () => {
  it('preserves existing editable fields while attaching fetched rawResponse data', () => {
    const item = {
      code: 'REAL-358',
      titleZh: '已有标题',
      summaryZh: '已有简介',
      coverUrl: 'https://cdn.example.com/existing-cover.jpg',
    };

    expect(
      mergeHydratedTranslation(
        item,
        JSON.stringify({
          id: 'scene-3',
          code: 'REAL-358',
          title: 'Upstream title',
        })
      )
    ).toEqual({
      ...item,
      rawResponse: JSON.stringify({
        id: 'scene-3',
        code: 'REAL-358',
        title: 'Upstream title',
      }),
    });
  });
});
