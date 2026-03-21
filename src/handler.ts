import { loadConfig } from './config';
import { forwardToJavStash } from './upstream/javstash';
import { TursoCache } from './cache/turso';
import { DeepLXTranslator } from './translator/deeplx';
import { processResponse } from './processor/response';
import type { GraphQLRequest } from './types';

/**
 * Handle GraphQL request
 */
export async function handleGraphQLRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, ApiKey',
    'Content-Type': 'application/json',
  };

  try {
    const config = loadConfig();
    const body = (await request.json()) as GraphQLRequest;

    // Forward to javstash
    const data = await forwardToJavStash(body, config.javstashApiKey);

    // Process response (translate + cache)
    const cache = new TursoCache(config.tursoUrl, config.tursoAuthToken);
    const translator = new DeepLXTranslator(config.deeplxApiUrl);
    const processedData = await processResponse(data, cache, translator);

    return new Response(JSON.stringify(processedData), {
      headers: corsHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ errors: [{ message }] }),
      { status: 500, headers: corsHeaders }
    );
  }
}
