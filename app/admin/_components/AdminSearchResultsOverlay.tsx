'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  RemoteSceneResults,
  type Translation,
} from '../../../components/shared';
import { SEARCH_SCENE_QUERY, type SceneData } from '../../../src/graphql/queries';
import { prepareRemoteSearchFallbackState } from './types';

export interface AdminSearchResultsOverlayProps {
  open: boolean;
  keyword: string;
  source?: 'local' | 'remote' | null;
  localResults?: Translation[];
  results?: SceneData[];
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onLocalSelect: (item: Translation) => void;
  onRemoteSelect: (item: Translation) => void;
}

export interface AdminResolvedSearchResults {
  source: 'local' | 'remote' | null;
  localResults: Translation[];
  results: SceneData[];
  error: string;
}

export function shouldApplyAdminSearchResponse({
  requestId,
  activeRequestId,
}: {
  requestId: number;
  activeRequestId: number;
}): boolean {
  return requestId === activeRequestId;
}

export async function fetchAdminRemoteSearchResults(term: string): Promise<{
  results: SceneData[];
  error: string;
}> {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) {
    return { results: [], error: '' };
  }

  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_SCENE_QUERY,
        variables: { term: normalizedTerm },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        results: [],
        error: data?.error || data?.message || '查询失败',
      };
    }

    if (data.errors) {
      return {
        results: [],
        error: data.errors[0]?.message || '查询失败',
      };
    }

    return {
      results: data.data?.searchScene || [],
      error: '',
    };
  } catch {
    return {
      results: [],
      error: '请求失败，请重试',
    };
  }
}

export async function fetchAdminLocalSearchResults(term: string): Promise<Translation[]> {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) {
    return [];
  }

  const params = new URLSearchParams({
    page: '1',
    pageSize: '20',
    sortBy: 'updated',
    search: normalizedTerm,
  });

  const response = await fetch(`/api/admin/translations?${params}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { items?: Translation[] };
  return data.items || [];
}

export async function resolveAdminSearchResults(
  term: string
): Promise<AdminResolvedSearchResults> {
  const keyword = term.trim();
  if (!keyword) {
    return {
      source: null,
      localResults: [],
      results: [],
      error: '',
    };
  }

  try {
    const localResults = await fetchAdminLocalSearchResults(keyword);
    const fallbackState = prepareRemoteSearchFallbackState(keyword, localResults);

    if (!fallbackState.open) {
      return {
        source: 'local',
        localResults,
        results: [],
        error: '',
      };
    }

    const remoteResult = await fetchAdminRemoteSearchResults(fallbackState.keyword);

    return {
      source: 'remote',
      localResults: [],
      results: remoteResult.results,
      error: remoteResult.error,
    };
  } catch {
    return {
      source: 'remote',
      localResults: [],
      results: [],
      error: '请求失败，请重试',
    };
  }
}

export function AdminSearchResultsOverlay({
  open,
  keyword,
  source: controlledSource,
  localResults: controlledLocalResults,
  results: controlledResults,
  loading: controlledLoading,
  error: controlledError,
  onClose,
  onLocalSelect,
  onRemoteSelect,
}: AdminSearchResultsOverlayProps) {
  const [internalState, setInternalState] = useState<AdminResolvedSearchResults>({
    source: null,
    localResults: [],
    results: [],
    error: '',
  });
  const [internalLoading, setInternalLoading] = useState(false);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    if (controlledSource !== undefined) {
      return;
    }

    if (!open) {
      setInternalState({
        source: null,
        localResults: [],
        results: [],
        error: '',
      });
      setInternalLoading(false);
      return;
    }

    const nextKeyword = keyword.trim();
    if (!nextKeyword) {
      setInternalState({
        source: null,
        localResults: [],
        results: [],
        error: '',
      });
      setInternalLoading(false);
      return;
    }

    const requestId = requestVersionRef.current + 1;
    requestVersionRef.current = requestId;
    setInternalLoading(true);
    setInternalState({
      source: null,
      localResults: [],
      results: [],
      error: '',
    });

    void (async () => {
      const resolvedState = await resolveAdminSearchResults(nextKeyword);

      if (
        !shouldApplyAdminSearchResponse({
          requestId,
          activeRequestId: requestVersionRef.current,
        })
      ) {
        return;
      }

      setInternalState(resolvedState);
      setInternalLoading(false);
    })();
  }, [controlledSource, keyword, open]);

  if (!open) {
    return null;
  }

  const source = controlledSource ?? internalState.source;
  const localResults = controlledLocalResults ?? internalState.localResults;
  const results = controlledResults ?? internalState.results;
  const loading = controlledLoading ?? internalLoading;
  const error = controlledError ?? internalState.error;

  return (
    <div className="fixed inset-0 z-40 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute inset-x-6 top-8 bottom-8 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15, 15, 20, 0.92)',
          border: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <h2 className="text-lg font-medium" style={{ color: 'var(--accent-gold)' }}>
              {source === 'local' ? '本地搜索结果' : 'Javstash 搜索结果'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {source === 'local'
                ? `“${keyword}” 的结果如下`
                : `本地未命中“${keyword}”，以下为远端结果`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            aria-label="关闭远端搜索结果"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(100%-73px)] overflow-y-auto p-6">
          {loading && results.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center">
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>搜索中...</span>
              </div>
            </div>
          ) : (
            <RemoteSceneResults
              results={results}
              localResults={localResults}
              loading={loading}
              error={error}
              keyword={keyword}
              source={source}
              onItemClick={source === 'local' ? onLocalSelect : onRemoteSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
