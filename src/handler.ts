import { loadConfig } from './config';
import { forwardToJavStash } from './upstream/javstash';
import { TursoCache } from './cache/turso';
import { DeepLXTranslator } from './translator/deeplx';
import { processResponse, tryRestoreFromCache } from './processor/response';
import type { GraphQLRequest } from './types';

/**
 * 处理外部传入的 GraphQL 请求。
 * 入口职责包括：加载配置、优先读缓存、回源查询、翻译并回写缓存。
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
    const cache = new TursoCache(config.tursoUrl, config.tursoAuthToken);

    // 先尝试直接从缓存还原完整响应，命中后可以跳过上游请求。
    const cachedResponse = await tryRestoreFromCache(body, cache);
    if (cachedResponse) {
      return new Response(JSON.stringify(cachedResponse), {
        headers: corsHeaders,
      });
    }

    // 缓存未命中时，请求 JavStash 上游接口。
    const data = await forwardToJavStash(body, config.javstashApiKey);

    // 对返回结果做翻译和缓存补全。
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
