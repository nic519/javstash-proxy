'use client';

import { AlertCircle, Frown, Search } from 'lucide-react';
import { ItemCard } from './ItemCard';
import { sceneToTranslation } from './sceneToTranslation';
import type { Translation } from './types';
import type { SceneData } from '@/src/graphql/queries';

interface RemoteSceneResultsProps {
  results: SceneData[];
  loading: boolean;
  error: string;
  keyword: string;
  onItemClick: (item: Translation) => void;
}

/**
 * 远程场景搜索结果区域
 * 负责渲染加载、错误、初始空状态、无结果和结果列表
 */
export function RemoteSceneResults({
  results,
  loading,
  error,
  keyword,
  onItemClick,
}: RemoteSceneResultsProps) {
  const normalizedKeyword = keyword.trim();
  const showResults = results.length > 0;
  const showInitialState = results.length === 0 && !loading && !normalizedKeyword && !error;
  const showNoResultsState = results.length === 0 && !loading && normalizedKeyword && !error;

  return (
    <div>
      {error && (
        <div
          className="mb-8 p-4 rounded-xl flex items-center gap-3 animate-fade-in"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showResults ? (
        <div className="space-y-4">
          {results.map((scene, index) => {
            const item = sceneToTranslation(scene);
            return (
              <div
                key={scene.id}
                style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
              >
                <ItemCard item={item} variant="card" onClick={onItemClick} />
              </div>
            );
          })}
        </div>
      ) : showNoResultsState ? (
        <div className="text-center py-20 animate-fade-in">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <Frown className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            未找到相关结果
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            请尝试其他关键词或检查输入
          </p>
        </div>
      ) : showInitialState ? (
        <div className="text-center py-20 animate-fade-in">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <Search className="w-10 h-10" style={{ color: 'var(--accent-gold)' }} />
          </div>
          <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            开始搜索
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            输入番号、演员名或关键词来搜索内容
          </p>
        </div>
      ) : null}
    </div>
  );
}
