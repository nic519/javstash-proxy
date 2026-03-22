import { handleGraphQLRequest } from '@/src/handler';

// 使用 Edge Runtime 以获得更快的响应速度
export const runtime = 'edge';

/**
 * GraphQL API 入口
 * 处理所有 GraphQL 查询请求
 */
export async function POST(request: Request) {
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, ApiKey',
      },
    });
  }

  // 委托给核心处理器处理 GraphQL 请求
  return handleGraphQLRequest(request);
}
