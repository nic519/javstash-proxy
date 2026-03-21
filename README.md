# JavStash Proxy

GraphQL proxy for javstash.org with automatic Japanese-to-Chinese translation.

## Setup

1. Install dependencies: `bun install`
2. Set environment variables
3. Deploy: `vercel --prod`

## Environment Variables

- `JAVSTASH_API_KEY` - javstash.org API key
- `TURSO_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso auth token
- `DEEPLX_API_URL` - DeepLX API endpoint

## Local Development

```bash
vercel dev
```