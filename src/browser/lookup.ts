import { TursoCache } from '@/src/cache/turso';
import { loadLookupConfig } from '@/src/config';
import { SEARCH_SCENE_QUERY } from '@/src/graphql/queries';
import { extractScenes, processResponse } from '@/src/processor/response';
import { DeepLXTranslator } from '@/src/translator/deeplx';
import type { BrowserLookupResult, GraphQLRequest } from '@/src/types';
import { forwardToJavStash } from '@/src/upstream/javstash';

const SCENE_CODE_PATTERN = /^[A-Z0-9]{2,10}-\d{2,6}$/;

export class BrowserLookupError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function normalizeSceneCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidSceneCode(code: string): boolean {
  return SCENE_CODE_PATTERN.test(code);
}

export async function lookupSceneByCode(
  code: string,
  apiKey: string
): Promise<BrowserLookupResult> {
  const normalizedCode = normalizeSceneCode(code);
  if (!isValidSceneCode(normalizedCode)) {
    throw new BrowserLookupError(
      'INVALID_CODE',
      'Missing or invalid scene code',
      400
    );
  }

  const config = loadLookupConfig();
  const cache = new TursoCache(config.tursoUrl, config.tursoAuthToken);
  const translator = new DeepLXTranslator(config.deeplxApiUrl);

  const request: GraphQLRequest = {
    operationName: 'Search',
    query: SEARCH_SCENE_QUERY,
    variables: {
      term: normalizedCode,
    },
  };

  const data = await forwardToJavStash(request, apiKey);
  const processedData = await processResponse(data, cache, translator);
  const exactScene = extractScenes(processedData).find(
    (scene) => normalizeSceneCode(scene.code ?? '') === normalizedCode
  );

  if (!exactScene) {
    throw new BrowserLookupError(
      'NOT_FOUND',
      `Scene not found for code ${normalizedCode}`,
      404
    );
  }

  return {
    code: normalizedCode,
    title: exactScene.title ?? '',
    description: exactScene.details ?? '',
    translated: true,
  };
}
