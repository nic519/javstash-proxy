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
