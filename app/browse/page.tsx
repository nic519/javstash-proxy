'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, User, Frown } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { SEARCH_SCENE_QUERY } from '@/src/graphql/queries';

/**
 * 场景数据结构
 * 定义 GraphQL 查询返回的场景信息类型
 */
interface Scene {
  /** 场景唯一 ID */
  id: string;
  /** 番号代码 */
  code: string;
  /** 标题 */
  title: string;
  /** 详细介绍 */
  details?: string;
  /** 发布日期 */
  date?: string;
  /** 时长（分钟） */
  duration?: number;
  /** 导演 */
  director?: string;
  /** 封面图片列表 */
  images?: { url: string }[];
  /** 相关链接列表 */
  urls?: { url: string }[];
  /** 演员列表 */
  performers?: { performer: { name: string; gender?: string } }[];
  /** 标签列表 */
  tags?: { name: string }[];
  /** 制作商 */
  studio?: { name: string };
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
  const [results, setResults] = useState<Scene[]>([]);
  // 错误信息
  const [error, setError] = useState('');

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((scene, index) => (
            <div
              key={scene.id}
              className="glass-card group overflow-hidden animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s`, opacity: 0 }}
            >
              {/* Image */}
              {scene.images?.[0]?.url && (
                <div className="image-hover aspect-[4/3]">
                  <img
                    src={scene.images[0].url}
                    alt={scene.code}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                {/* Code Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="tag">{scene.code}</span>
                  {scene.date && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {scene.date}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-[var(--accent-gold)]">
                  {scene.title}
                </h3>

                {/* Description */}
                {scene.details && (
                  <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                    {scene.details}
                  </p>
                )}

                {/* Performers */}
                {scene.performers && scene.performers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <User className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {scene.performers.map((p) => p.performer?.name).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {scene.tags && scene.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scene.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {scene.tags.length > 4 && (
                      <span
                        className="text-xs px-2 py-1 rounded-md"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        +{scene.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
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
    </div>
  );
}
