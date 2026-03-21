'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';

interface Scene {
  code: string;
  title: string;
  titleZh?: string;
  details?: string;
  summaryZh?: string;
  date?: string;
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
            query QueryScenes($input: SceneQueryInput!) {
              queryScenes(input: $input) {
                scenes {
                  code
                  title
                  details
                  date
                  performers {
                    performer {
                      name
                    }
                  }
                  tags {
                    name
                  }
                }
              }
            }
          `,
          variables: { input: { text: keyword, per_page: 20 } },
        }),
      });

      const data = await res.json();
      if (data.errors) {
        setError(data.errors[0]?.message || '查询失败');
      } else {
        setResults(data.data?.queryScenes?.scenes || []);
      }
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">数据浏览</h2>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索关键词..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((scene) => (
            <div key={scene.code || scene.title} className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-1">{scene.code}</div>
              <h3 className="font-semibold mb-2">
                {scene.titleZh || scene.title}
              </h3>
              {scene.summaryZh && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {scene.summaryZh}
                </p>
              )}
              {scene.performers && scene.performers.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-500">演员: </span>
                  {scene.performers.map((p) => p.performer?.name).filter(Boolean).join(', ')}
                </div>
              )}
              {scene.tags && scene.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {scene.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag.name}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && keyword && !error && (
          <p className="text-gray-500 text-center py-8">暂无结果</p>
        )}
      </main>
    </div>
  );
}
