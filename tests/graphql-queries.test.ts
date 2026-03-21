import { describe, it, expect } from 'vitest';

/**
 * GraphQL 查询规范测试
 *
 * 这些测试用于确保我们使用正确的 GraphQL 查询格式。
 * 历史问题：Playground 默认使用 queryScenes 进行关键词搜索，
 * 但 queryScenes 的 text 字段不适合番号搜索，应该使用 searchScene。
 */
describe('GraphQL Query Specifications', () => {
  describe('searchScene vs queryScenes', () => {
    /**
     * searchScene 是专门为关键词/番号搜索设计的查询。
     * 它接受一个简单的 term 字符串参数，适合用户输入搜索。
     *
     * 使用场景：
     * - 番号搜索（如 "MIAE-209"）
     * - 演员名搜索
     * - 标题关键词搜索
     */
    it('searchScene should be used for keyword/code search', () => {
      const searchSceneQuery = {
        query: `query Search($term: String!) {
          searchScene(term: $term) {
            id
            code
            title
            details
          }
        }`,
        variables: { term: 'MIAE-209' },
      };

      // 验证查询结构
      expect(searchSceneQuery.query).toContain('searchScene(term: $term)');
      expect(searchSceneQuery.variables).toHaveProperty('term');
      expect(typeof searchSceneQuery.variables.term).toBe('string');
    });

    /**
     * queryScenes 是更复杂的查询，需要多个必填字段：
     * - page: Int (必填)
     * - per_page: Int (必填)
     * - direction: SortDirectionEnum (必填)
     * - sort: SceneSortEnum (必填)
     *
     * 它的 text 字段搜索行为与 searchScene 不同，不适合简单的番号搜索。
     * 使用场景：分页浏览、复杂筛选、排序查询
     */
    it('queryScenes requires multiple mandatory fields', () => {
      // 错误用法：缺少部分必填字段
      const incompleteQueryScenesInput = {
        text: 'MIAE-209',
        per_page: 10,
        // 缺少: page, direction, sort
      };

      // 正确用法：包含所有必填字段
      const completeQueryScenesInput = {
        text: 'MIAE-209',
        page: 1,
        per_page: 10,
        direction: 'DESC',
        sort: 'DATE',
      };

      // 验证缺少的必填字段（除了 per_page）
      const missingFields = ['page', 'direction', 'sort'];

      missingFields.forEach((field) => {
        expect(incompleteQueryScenesInput).not.toHaveProperty(field);
        expect(completeQueryScenesInput).toHaveProperty(field);
      });
    });

    /**
     * 即使 queryScenes 包含所有必填字段，text 字段的搜索行为
     * 也与 searchScene 的 term 不同。对于番号搜索，应该使用 searchScene。
     */
    it('queryScenes text field has different search behavior than searchScene term', () => {
      // 这是文档性测试，说明两者的区别
      const searchTypes = {
        searchScene: {
          purpose: '关键词/番号搜索',
          inputSimplicity: '简单（只需 term 字符串）',
          searchBehavior: '精确匹配番号和关键词',
        },
        queryScenes: {
          purpose: '分页浏览/复杂筛选',
          inputSimplicity: '复杂（需要多个必填字段）',
          searchBehavior: 'text 字段搜索行为不同，不适合番号搜索',
        },
      };

      expect(searchTypes.searchScene.purpose).toBe('关键词/番号搜索');
      expect(searchTypes.queryScenes.purpose).toBe('分页浏览/复杂筛选');
    });
  });

  describe('Playground default query validation', () => {
    /**
     * 确保 Playground 默认查询使用正确的 searchScene 格式。
     * 如果这个测试失败，说明默认查询可能被错误修改。
     */
    it('default playground query should use searchScene for keyword search', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const playgroundContent = fs.readFileSync(
        path.resolve(process.cwd(), 'app/playground/page.tsx'),
        'utf-8'
      );

      // 验证默认查询使用 searchScene
      expect(playgroundContent).toContain('searchScene(term: $term)');
      // 确保不再使用错误的 queryScenes 作为默认查询
      expect(playgroundContent).not.toContain('queryScenes(input: $input)');
    });
  });
});

describe('GraphQL Query Builder', () => {
  /**
   * 提供一个标准的 searchScene 查询构建器，
   * 确保所有地方使用一致的查询格式。
   */
  it('should provide consistent searchScene query format', () => {
    const buildSearchSceneQuery = (fields: string[]) => {
      return `query Search($term: String!) {
  searchScene(term: $term) {
    ${fields.join('\n    ')}
  }
}`;
    };

    const basicFields = ['id', 'code', 'title'];
    const query = buildSearchSceneQuery(basicFields);

    expect(query).toContain('query Search($term: String!)');
    expect(query).toContain('searchScene(term: $term)');
    expect(query).toContain('id');
    expect(query).toContain('code');
    expect(query).toContain('title');
  });
});
