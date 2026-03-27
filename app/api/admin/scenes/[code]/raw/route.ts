import { NextResponse } from 'next/server';
import { loadConfig } from '@/src/config';
import { forwardToJavStash } from '@/src/upstream/javstash';
import { TursoCache } from '@/src/cache/turso';
import { SCENE_FRAGMENT, type SceneData } from '@/src/graphql/queries';

/**
 * 获取单个场景的原始数据
 * 如果本地缓存没有 rawResponse，则从 JAVstash 获取
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const config = loadConfig();
    const cache = new TursoCache(config.tursoUrl, config.tursoAuthToken);
    const { code } = await params;

    // 先检查本地缓存
    const cached = await cache.getTranslation(code);
    if (cached?.rawResponse) {
      // 验证格式：如果是数组则视为无效数据，需要重新请求
      try {
        const parsed = JSON.parse(cached.rawResponse);
        if (Array.isArray(parsed)) {
          // 数组格式是无效的历史数据，继续往下请求新数据
        } else {
          return NextResponse.json({ rawResponse: cached.rawResponse });
        }
      } catch {
        // 解析失败，继续往下请求
      }
    }

    // 本地没有 rawResponse，用 searchScene 查询
    const graphqlQuery = {
      operationName: 'Search',
      query: `
        query Search($term: String!) {
          searchScene(term: $term) {
            ${SCENE_FRAGMENT}
          }
        }
      `,
      variables: { term: code },
    };

    const response = await forwardToJavStash(graphqlQuery, config.javstashApiKey);

    // 提取场景数据 - searchScene 返回数组，需要找到匹配的
    const scenes = (response as { data?: { searchScene?: SceneData[] } })?.data?.searchScene;
    if (scenes && Array.isArray(scenes) && scenes.length > 0) {
      // 找到完全匹配 code 的场景，或者取第一个
      const scene = scenes.find((s) => s.code?.toUpperCase() === code.toUpperCase()) || scenes[0];
      const rawResponse = JSON.stringify(scene);

      // 保存到缓存
      await cache.updateTranslation(code, { rawResponse });

      return NextResponse.json({ rawResponse });
    }

    return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
