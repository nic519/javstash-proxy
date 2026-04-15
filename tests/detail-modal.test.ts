import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SceneData } from '../src/graphql/queries';
import { DetailView } from '../components/shared/detail-modal';
import { EditFormView } from '../components/shared/detail-modal/EditFormView';
import { encodePublicCodeToken } from '../lib/public-code-token';
import {
  getPerformerNames,
  getTagColor,
  parseSceneData,
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

describe('parseSceneData', () => {
  it('returns null for legacy array payloads', () => {
    expect(parseSceneData(JSON.stringify([{ code: 'REAL-358' }]))).toBeNull();
  });
});

describe('EditFormView', () => {
  it('renders raw_response as an editable textarea in edit mode', () => {
    const markup = renderToStaticMarkup(
      createElement(EditFormView, {
        form: {
          titleZh: '标题',
          summaryZh: '简介',
          coverUrl: 'https://example.com/cover.jpg',
          rawResponse: '{"code":"ABP-123"}',
        },
        onChange: () => {},
        onSave: () => {},
        onCancel: () => {},
        saving: false,
      })
    );

    expect(markup).toContain('raw_response');
    expect(markup).toContain('{&quot;code&quot;:&quot;ABP-123&quot;}');
  });
});

describe('DetailView', () => {
  it('renders preset tag toggles in detail mode', () => {
    const markup = renderToStaticMarkup(
      createElement(DetailView, {
        item: {
          code: 'ABP-123',
          titleZh: '标题',
          summaryZh: '简介',
        },
        form: {
          titleZh: '标题',
          summaryZh: '简介',
          coverUrl: '',
          rawResponse: '',
        },
        onClose: () => {},
        onCopyCode: () => {},
        copied: false,
        rawData: null,
        activeTags: ['watch_later'],
        onToggleTag: () => {},
        tagsDisabled: false,
      })
    );

    expect(markup).toContain('aria-label="稍后再看"');
    expect(markup).toContain('aria-label="特别收藏"');
    expect(markup).toContain('aria-label="不喜欢"');
  });

  it('renders external quick links below the cover', () => {
    const token = encodePublicCodeToken('ABP-123');
    const markup = renderToStaticMarkup(
      createElement(DetailView, {
        item: {
          code: 'ABP-123',
          titleZh: '标题',
          summaryZh: '简介',
        },
        form: {
          titleZh: '标题',
          summaryZh: '简介',
          coverUrl: 'https://example.com/cover.jpg',
          rawResponse: '',
        },
        onClose: () => {},
        onCopyCode: () => {},
        copied: false,
        rawData: null,
        activeTags: [],
        onToggleTag: () => {},
        tagsDisabled: false,
      })
    );

    expect(markup).toContain('>JavDB<');
    expect(markup).toContain('>JavBus<');
    expect(markup).toContain('>StashApp<');
    expect(markup).toContain('>单独页面<');
    expect(markup).toContain('href="https://javdb.com/search?q=ABP-123&amp;f=all"');
    expect(markup).toContain('href="https://javbus.com/ABP-123"');
    expect(markup).toContain('href="http://192.168.7.171:9999/scenes?q=ABP-123&amp;sortby=date"');
    expect(markup).toContain(`href="/v/${token}"`);
  });
});
