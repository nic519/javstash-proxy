// 场景查询片段，尽量把缓存和展示需要的字段一次性取全。
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

// 按关键词搜索场景时使用的标准查询。
export const SEARCH_SCENE_QUERY = `query Search($term: String!) {
  searchScene(term: $term) {
    ${SCENE_FRAGMENT}
  }
}`;
