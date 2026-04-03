'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { SEARCH_SCENE_QUERY, type SceneData } from '@/src/graphql/queries';
import { DetailModal, RemoteSceneResults, type Translation } from '@/components/shared';

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
    const term = keyword.trim();
    if (!term) return;

    setLoading(true);
    setError('');

    try {
      // 发送 GraphQL 查询请求
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: SEARCH_SCENE_QUERY,
          variables: { term },
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

        <RemoteSceneResults
          results={results}
          loading={loading}
          error={error}
          keyword={keyword}
          onItemClick={handleItemClick}
        />
      </main>

      {/* Detail Modal - 只读模式 */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onHydrate={setSelected}
          readOnly
        />
      )}
    </div>
  );
}
