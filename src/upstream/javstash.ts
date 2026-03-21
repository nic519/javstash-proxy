import type { GraphQLRequest } from '../types';

const JAVSTASH_URL = 'https://javstash.org/graphql';

/**
 * Forward GraphQL request to javstash.org
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
    const body = await response.text();
    throw new Error(`JavStash error: ${response.status} ${response.statusText} - ${body}`);
  }

  return response.json();
}