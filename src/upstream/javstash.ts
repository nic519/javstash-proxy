import type { GraphQLRequest } from '../types';

const JAVSTASH_URL = 'https://javstash.org/graphql';

/**
 * 将 GraphQL 请求转发到 JavStash 官方接口。
 */
export async function forwardToJavStash(
  request: GraphQLRequest,
  apiKey: string
): Promise<unknown> {
  const response = await fetch(JAVSTASH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ApiKey': apiKey,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // 保留上游原始响应文本，方便排查鉴权或查询参数问题。
    const body = await response.text();
    throw new Error(`JavStash error: ${response.status} ${response.statusText} - ${body}`);
  }

  return response.json();
}
