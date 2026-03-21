import { handleGraphQLRequest } from '@/src/handler';

export const runtime = 'edge';

export async function POST(request: Request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, ApiKey',
      },
    });
  }

  return handleGraphQLRequest(request);
}
