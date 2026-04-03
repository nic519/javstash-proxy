import { describe, expect, it } from 'vitest';
import { getDetailHeaderMeta } from '@/components/shared/detail-modal/helpers';

describe('getDetailHeaderMeta', () => {
  it('returns header items in the display order used by the modal row', () => {
    const meta = getDetailHeaderMeta({
      code: 'ABC-123',
      director: 'Test Director',
      releaseDate: '2026/04/04',
      studioName: 'Test Studio',
    });

    expect(meta).toEqual([
      { key: 'code', label: '番号', value: 'ABC-123' },
      { key: 'director', label: '导演', value: 'Test Director' },
      { key: 'date', label: '', value: '2026/04/04' },
      { key: 'studio', label: '', value: 'Test Studio' },
    ]);
  });

  it('omits empty optional metadata but always keeps the code visible', () => {
    const meta = getDetailHeaderMeta({
      code: 'ABC-123',
      director: '   ',
      releaseDate: null,
      studioName: '',
    });

    expect(meta).toEqual([{ key: 'code', label: '番号', value: 'ABC-123' }]);
  });
});
