'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, User, Frown } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';

interface Scene {
  id: string;
  code: string;
  title: string;
  details?: string;
  date?: string;
  images?: { url: string }[];
  performers?: { performer: { name: string } }[];
  tags?: { name: string }[];
}

export default function BrowsePage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Scene[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query Search($term: String!) {
              searchScene(term: $term) {
                id
                code
                title
                details
                date
                images { url }
                performers {
                  performer { name }
                }
                tags {
                  name
                }
              }
            }
          `,
          variables: { term: keyword },
        }),
      });

      const data = await res.json();
      if (data.errors) {
        setError(data.errors[0]?.message || '查询失败');
      } else {
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
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>搜索中</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
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
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
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
              <svg className="w-10 h-10" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
              <svg className="w-10 h-10" style={{ color: 'var(--accent-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
