'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';

interface CacheStats {
  cacheCount: number;
  lastUpdated: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/cache');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      setMessage('获取统计失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearCache = async () => {
    if (!confirm('确定要清除所有缓存吗？此操作不可恢复。')) {
      return;
    }

    setClearing(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/cache', { method: 'DELETE' });

      if (res.ok) {
        setMessage('缓存已清除');
        await fetchStats();
      } else {
        setMessage('清除失败');
      }
    } catch {
      setMessage('清除失败');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen flex animated-bg">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 relative z-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="font-display text-4xl lg:text-5xl font-semibold mb-3 gradient-text">
            缓存管理
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            查看系统统计信息和管理翻译缓存
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{
              borderColor: 'var(--border-light)',
              borderTopColor: 'var(--accent-gold)',
            }} />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {/* Cache Count */}
              <div className="glass-card p-6 animate-fade-in stagger-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}>
                    <svg className="w-6 h-6" style={{ color: 'var(--accent-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>缓存条目</p>
                    <p className="text-3xl font-bold gradient-text">
                      {stats?.cacheCount?.toLocaleString() ?? 0}
                    </p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  已缓存的翻译条目数量
                </p>
              </div>

              {/* Last Updated */}
              <div className="glass-card p-6 animate-fade-in stagger-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <svg className="w-6 h-6" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>最后更新</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {stats?.lastUpdated
                        ? new Date(stats.lastUpdated).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  缓存最近一次更新时间
                </p>
              </div>

              {/* Status */}
              <div className="glass-card p-6 animate-fade-in stagger-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <svg className="w-6 h-6" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>系统状态</p>
                    <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
                      运行正常
                    </p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  所有服务运行正常
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="glass-card p-6 animate-fade-in stagger-4">
              <h3 className="text-xl font-semibold mb-4">危险操作</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                清除缓存将删除所有已缓存的翻译数据，后续请求需要重新翻译。
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleClearCache}
                  disabled={clearing}
                  className="btn-danger flex items-center gap-2"
                >
                  {clearing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>清除中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>清除所有缓存</span>
                    </>
                  )}
                </button>

                {message && (
                  <span
                    className="text-sm px-4 py-2 rounded-lg animate-fade-in"
                    style={{
                      background: message.includes('失败') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: message.includes('失败') ? '#fca5a5' : '#86efac',
                    }}
                  >
                    {message}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
