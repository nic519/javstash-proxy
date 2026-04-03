import { describe, expect, it } from 'vitest';
import type { SceneData } from '../src/graphql/queries';
import { getPerformerNames } from '../components/shared/DetailModal';

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
