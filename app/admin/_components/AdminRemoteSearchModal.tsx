'use client';

import { Loader2, X } from 'lucide-react';
import {
  ItemCard,
  RemoteSceneResults,
  type Translation,
} from '../../../components/shared';
import { SEARCH_SCENE_QUERY, type SceneData } from '../../../src/graphql/queries';

export interface AdminRemoteSearchModalProps {
  open: boolean;
  keyword: string;
  source: 'local' | 'remote' | null;
  localResults: Translation[];
  results: SceneData[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onLocalSelect: (item: Translation) => void;
  onRemoteSelect: (item: Translation) => void;
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

export function AdminRemoteSearchModal({
  open,
  keyword,
  source,
  localResults,
  results,
  loading,
  error,
  onClose,
  onLocalSelect,
  onRemoteSelect,
}: AdminRemoteSearchModalProps) {
  if (!open) {
    return null;
  }

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
          ) : source === 'local' ? (
            localResults.length > 0 ? (
              <div className="space-y-4">
                {localResults.map((item, index) => (
                  <div key={item.code} style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}>
                    <ItemCard item={item} variant="card" onClick={onLocalSelect} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
                暂无搜索结果
              </div>
            )
          ) : (
            <RemoteSceneResults
              results={results}
              loading={loading}
              error={error}
              keyword={keyword}
              onItemClick={onRemoteSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
