import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PerformerData } from '../src/graphql/queries';

const forwardToJavStashMock = vi.fn();

vi.mock('@/src/upstream/javstash', () => ({
  forwardToJavStash: forwardToJavStashMock,
}));

describe('performers service', () => {
  beforeEach(() => {
    forwardToJavStashMock.mockReset();
  });

  it('returns a cached performer without calling upstream', async () => {
    const cachedPerformer = {
      id: 'performer-1',
      name: '麻宮わかな',
      aliases: ['Wakana Asamiya'],
      images: [{ url: 'https://example.com/a.jpg' }],
      full_json: { id: 'performer-1', name: '麻宮わかな' },
      updated_at: '2026-04-16T00:00:00.000Z',
    };
    const cache = {
      getPerformer: vi.fn().mockResolvedValue(cachedPerformer),
      upsertPerformer: vi.fn(),
    };

    const { getOrFetchPerformer } = await import('../src/performers');
    const result = await getOrFetchPerformer('performer-1', cache as never, 'api-key');

    expect(result).toEqual(cachedPerformer);
    expect(cache.getPerformer).toHaveBeenCalledWith('performer-1');
    expect(forwardToJavStashMock).not.toHaveBeenCalled();
    expect(cache.upsertPerformer).not.toHaveBeenCalled();
  });

  it('fetches, stores, and returns a performer when cache misses', async () => {
    const fetchedPerformer: PerformerData = {
      id: 'performer-1',
      name: '麻宮わかな',
      aliases: ['Wakana Asamiya'],
      birth_date: '1998-01-25',
      height: 165,
      cup_size: 'E',
      band_size: 90,
      waist_size: 60,
      hip_size: 88,
      career_start_year: 2021,
      career_end_year: undefined,
      images: [{ url: 'https://example.com/a.jpg' }],
    };
    const cache = {
      getPerformer: vi.fn().mockResolvedValue(null),
      upsertPerformer: vi.fn(),
    };
    forwardToJavStashMock.mockResolvedValue({
      data: {
        findPerformer: fetchedPerformer,
      },
    });

    const { getOrFetchPerformer } = await import('../src/performers');
    const result = await getOrFetchPerformer('performer-1', cache as never, 'api-key');

    expect(forwardToJavStashMock).toHaveBeenCalledWith(
      expect.objectContaining({
        operationName: 'FindPerformer',
        variables: { id: 'performer-1' },
      }),
      'api-key'
    );
    expect(cache.upsertPerformer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'performer-1',
        name: '麻宮わかな',
        aliases: ['Wakana Asamiya'],
        birth_date: '1998-01-25',
        height: 165,
        cup_size: 'E',
        band_size: 90,
        waist_size: 60,
        hip_size: 88,
        career_start_year: 2021,
        images: [{ url: 'https://example.com/a.jpg' }],
        full_json: fetchedPerformer,
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'performer-1',
        name: '麻宮わかな',
        full_json: fetchedPerformer,
      })
    );
  });

  it('still returns performer data when cache read or write fails', async () => {
    const fetchedPerformer: PerformerData = {
      id: 'performer-1',
      name: '麻宮わかな',
      aliases: ['Wakana Asamiya'],
      birth_date: '1998-01-25',
      height: 165,
      cup_size: 'E',
      band_size: 90,
      waist_size: 60,
      hip_size: 88,
      career_start_year: 2021,
      images: [{ url: 'https://example.com/a.jpg' }],
    };
    const cache = {
      getPerformer: vi.fn().mockRejectedValue(new Error('ECONNRESET')),
      upsertPerformer: vi.fn().mockRejectedValue(new Error('ECONNRESET')),
    };
    forwardToJavStashMock.mockResolvedValue({
      data: {
        findPerformer: fetchedPerformer,
      },
    });

    const { getOrFetchPerformer } = await import('../src/performers');
    const result = await getOrFetchPerformer('performer-1', cache as never, 'api-key');

    expect(result).toEqual(
      expect.objectContaining({
        id: 'performer-1',
        name: '麻宮わかな',
        full_json: fetchedPerformer,
      })
    );
  });
});
