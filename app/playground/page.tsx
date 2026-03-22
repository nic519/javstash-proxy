'use client';

import { useState } from 'react';
import { Loader2, Play, Terminal } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { SEARCH_SCENE_QUERY } from '@/src/graphql/queries';

const defaultVariables = `{
  "term": "MIAE-209"
}`;

export default function PlaygroundPage() {
  const [query, setQuery] = useState(SEARCH_SCENE_QUERY);
  const [variables, setVariables] = useState(defaultVariables);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setResponse('');

    try {
      let parsedVariables = {};
      try {
        parsedVariables = JSON.parse(variables);
      } catch {
        // ignore
      }

      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: parsedVariables }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animated-bg">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 relative z-10">
        {/* Editor Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-6 animate-fade-in stagger-1">
            {/* Query Editor */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Query</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>GraphQL</span>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-72 p-5 font-mono text-sm bg-transparent resize-none focus:outline-none"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
                  lineHeight: '1.7',
                }}
                spellCheck={false}
              />
            </div>

            {/* Variables Editor */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Variables</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>JSON</span>
              </div>
              <textarea
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                className="w-full h-28 p-5 font-mono text-sm bg-transparent resize-none focus:outline-none"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
                  lineHeight: '1.7',
                }}
                spellCheck={false}
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>执行中...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>执行查询</span>
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Response */}
          <div className="animate-fade-in stagger-2">
            <div className="glass-card overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Response</span>
                </div>
                {response && (
                  <button
                    onClick={() => navigator.clipboard.writeText(response)}
                    className="text-xs px-3 py-1 rounded-md transition-colors duration-200 hover:bg-white/5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    复制
                  </button>
                )}
              </div>
              <div className="flex-1 p-5 overflow-auto" style={{ minHeight: '500px' }}>
                {response ? (
                  <pre
                    className="font-mono text-sm whitespace-pre-wrap"
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
                      lineHeight: '1.7',
                    }}
                  >
                    {response}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Terminal className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                      <p style={{ color: 'var(--text-muted)' }}>点击"执行查询"查看结果</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
