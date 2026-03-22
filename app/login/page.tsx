'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';

type LoginType = 'admin' | 'javstash';

/**
 * 登录页面组件
 * 支持两种登录方式：管理员密码 和 JavStash API Key
 */
export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'invalid_credentials':
        return '密码错误';
      case 'javstash_invalid':
        return 'API Key 无效';
      case 'network_error':
        return '网络错误，请重试';
      default:
        return '登录失败';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, type: loginType }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
      } else {
        setError(getErrorMessage(data.error));
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="p-8 rounded-2xl w-96" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <Layers className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-wide gradient-text">
              JavStash
            </h1>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Proxy Server</span>
          </div>
        </div>

        {/* 登录方式选择 */}
        <div className="flex mb-6 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            style={{
              background: loginType === 'admin' ? 'var(--bg-secondary)' : 'transparent',
              color: loginType === 'admin' ? 'var(--accent-gold)' : 'var(--text-muted)',
              boxShadow: loginType === 'admin' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            管理员
          </button>
          <button
            type="button"
            onClick={() => setLoginType('javstash')}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            style={{
              background: loginType === 'javstash' ? 'var(--bg-secondary)' : 'transparent',
              color: loginType === 'javstash' ? 'var(--accent-gold)' : 'var(--text-muted)',
              boxShadow: loginType === 'javstash' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            JavStash
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              {loginType === 'admin' ? '管理员密码' : 'API Key'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={loginType === 'admin' ? '请输入密码' : '请输入 JavStash API Key'}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm mb-4" style={{ color: '#ef4444' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {loginType === 'javstash' && (
          <p className="text-xs mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
            JavStash 登录无法访问管理页面
          </p>
        )}
      </div>
    </div>
  );
}
