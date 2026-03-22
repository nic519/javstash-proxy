'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 登录页面组件
 * 提供管理员密码输入和验证功能
 */
export default function LoginPage() {
  const router = useRouter();
  // 密码输入值
  const [password, setPassword] = useState('');
  // 错误提示信息
  const [error, setError] = useState('');
  // 登录中加载状态
  const [loading, setLoading] = useState(false);

  /**
   * 处理登录表单提交
   * 向后端发送密码验证请求
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 发送登录请求
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // 登录成功，跳转到首页
        router.push('/');
      } else {
        setError('密码错误');
      }
    } catch {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">JavStash Proxy</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">管理员密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="请输入密码"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
