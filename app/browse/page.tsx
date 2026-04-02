'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, Frown } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { SEARCH_SCENE_QUERY, type SceneData } from '@/src/graphql/queries';
import { ItemCard, DetailModal, type Translation } from '@/components/shared';

/**
 * 将 GraphQL Scene 数据转换为 Translation 类型
 */
function sceneToTranslation(scene: SceneData): Translation {
  return {
    code: scene.code,
    titleZh: scene.title || '',
    summaryZh: scene.details || '',
    coverUrl: scene.images?.[0]?.url,
    rawResponse: JSON.stringify(scene),
    updatedAt: scene.updated,
  };
}

/**
 * 浏览页面组件
 * 提供场景搜索和结果展示功能
 */
export default function BrowsePage() {
  // 搜索关键词
  const [keyword, setKeyword] = useState('');
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 搜索结果列表
  const [results, setResults] = useState<SceneData[]>([]);
  // 错误信息
  const [error, setError] = useState('');
  // 当前选中的条目（用于详情弹窗）
  const [selected, setSelected] = useState<Translation | null>(null);

  /**
   * 处理搜索表单提交
   * 向 GraphQL API 发送搜索请求
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');

    try {
      // 发送 GraphQL 查询请求
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: SEARCH_SCENE_QUERY,
          variables: { term: keyword },
        }),
      });

      const data = await res.json();
      if (data.errors) {
        // GraphQL 返回错误
        setError(data.errors[0]?.message || '查询失败');
      } else {
        // 更新搜索结果
        setResults(data.data?.searchScene || []);
      }
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理点击卡片
   * 将 SceneData 转换为 Translation 并设置选中状态
   */
  const handleItemClick = (item: Translation) => {
    setSelected(item);
  };

  return (
    <div className="min-h-screen flex animated-bg">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 relative z-10">
        {/* Search Bar */}
        <div className="mb-10 animate-fade-in stagger-1">
          <form onSubmit={handleSearch}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="输入番号、演员名或关键词搜索..."
                  className="w-full py-4 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    paddingLeft: '3rem',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>搜索中</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>搜索</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-xl flex items-center gap-3 animate-fade-in" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5'
          }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {results.map((scene, index) => {
            const item = sceneToTranslation(scene);
            return (
              <div
                key={scene.id}
                style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
              >
                <ItemCard
                  item={item}
                  variant="card"
                  onClick={handleItemClick}
                />
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {results.length === 0 && !loading && keyword && !error && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
              <Frown className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              未找到相关结果
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              请尝试其他关键词或检查输入
            </p>
          </div>
        )}

        {/* Initial State */}
        {results.length === 0 && !loading && !keyword && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <Search className="w-10 h-10" style={{ color: 'var(--accent-gold)' }} />
            </div>
            <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              开始搜索
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              输入番号、演员名或关键词来搜索内容
            </p>
          </div>
        )}
      </main>

      {/* Detail Modal - 只读模式 */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          readOnly
        />
      )}
    </div>
  );
}
