'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';

const defaultQuery = `# GraphQL 查询示例
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
}`;

const defaultVariables = `{
  "input": {
    "text": "SSIS",
    "per_page": 10
  }
}`;

export default function PlaygroundPage() {
  const [query, setQuery] = useState(defaultQuery);
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
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">GraphQL Playground</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Query</h3>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              spellCheck={false}
            />

            <h3 className="font-semibold mb-2 mt-4">Variables</h3>
            <textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full h-24 p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              spellCheck={false}
            />

            <button
              onClick={handleExecute}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '执行中...' : '执行查询'}
            </button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response</h3>
            <textarea
              value={response}
              readOnly
              className="w-full h-[450px] p-4 font-mono text-sm border rounded-lg bg-gray-100"
              spellCheck={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
