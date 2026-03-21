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
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">缓存管理</h2>

        {loading ? (
          <p>加载中...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">缓存条目</h3>
                <p className="text-4xl font-bold text-blue-600">
                  {stats?.cacheCount ?? 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">已缓存的翻译条目数</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">最后更新</h3>
                <p className="text-lg">
                  {stats?.lastUpdated
                    ? new Date(stats.lastUpdated).toLocaleString('zh-CN')
                    : '-'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">操作</h3>
              <button
                onClick={handleClearCache}
                disabled={clearing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {clearing ? '清除中...' : '清除所有缓存'}
              </button>
              {message && <p className="mt-4 text-sm">{message}</p>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
