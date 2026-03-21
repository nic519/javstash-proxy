import { describe, it, expect } from 'vitest';
import { extractScenes } from '../src/processor/response.js';

describe('extractScenes', () => {
  it('should extract scenes from searchScene response', () => {
    const data = {
      data: {
        searchScene: [
          { code: 'SSIS-001', title: 'Title 1', details: 'Details 1' },
          { code: 'SSIS-002', title: 'Title 2', details: 'Details 2' },
        ],
      },
    };

    const scenes = extractScenes(data);

    expect(scenes).toHaveLength(2);
    expect(scenes[0].code).toBe('SSIS-001');
    expect(scenes[1].code).toBe('SSIS-002');
  });

  it('should handle nested structures', () => {
    const data = {
      data: {
        findScene: {
          scenes: [
            { code: 'SSIS-001', title: 'Title' },
          ],
        },
      },
    };

    const scenes = extractScenes(data);

    expect(scenes).toHaveLength(1);
    expect(scenes[0].code).toBe('SSIS-001');
  });

  it('should return empty array for no scenes', () => {
    const data = { data: { findPerformer: { name: 'Test' } } };
    const scenes = extractScenes(data);

    expect(scenes).toEqual([]);
  });

  it('should handle null and undefined', () => {
    expect(extractScenes(null)).toEqual([]);
    expect(extractScenes(undefined)).toEqual([]);
  });
});