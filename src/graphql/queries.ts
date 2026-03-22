/**
 * GraphQL 查询常量
 * 统一管理所有 GraphQL 查询，确保缓存和展示使用相同的字段
 */

export const SCENE_FRAGMENT = `
  id
  code
  title
  details
  date
  duration
  director
  created
  updated
  images { url }
  urls { url }
  performers {
    performer {
      id
      name
      gender
      urls { url }
      images { url }
    }
  }
  tags {
    id
    name
  }
  studio {
    id
    name
    urls { url }
  }
`;

export const SEARCH_SCENE_QUERY = `query Search($term: String!) {
  searchScene(term: $term) {
    ${SCENE_FRAGMENT}
  }
}`;
