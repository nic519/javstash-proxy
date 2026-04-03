'use client';

import { Loader2, X } from 'lucide-react';
import { RemoteSceneResults, type Translation } from '../../../components/shared';
import { SEARCH_SCENE_QUERY, type SceneData } from '../../../src/graphql/queries';

export interface AdminRemoteSearchModalProps {
  open: boolean;
  keyword: string;
  results: SceneData[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onSelect: (item: Translation) => void;
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

export function AdminRemoteSearchModal({
  open,
  keyword,
  results,
  loading,
  error,
  onClose,
  onSelect,
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
              Javstash 搜索结果
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              本地未命中“{keyword}”，以下为远端结果
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
                <span>远端搜索中...</span>
              </div>
            </div>
          ) : (
            <RemoteSceneResults
              results={results}
              loading={loading}
              error={error}
              keyword={keyword}
              onItemClick={onSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
