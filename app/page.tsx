'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';

type LoginType = 'admin' | 'javstash';

/**
 * 首页 - 登录入口
 * 支持两种登录方式：管理员密码 和 JavStash API Key
 */
export default function HomePage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpointUrl = 'https://javstash.vercel.app/api/graphql';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpointUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 静默失败
    }
  };

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
        // 根据登录类型重定向到不同页面
        router.push(loginType === 'admin' ? '/admin' : '/browse');
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* 顶部装饰线 */}
      <div className="h-px w-full" style={{
        background: 'linear-gradient(90deg, transparent, var(--accent-gold), transparent)'
      }} />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* 左侧：品牌信息 */}
          <div className="space-y-10">
            {/* Logo + 标题 */}
            <div className="flex items-end gap-5">
              <img
                src="/logo.svg"
                alt="JavStash Logo"
                className="w-10 h-14 object-contain"
              />
              <div>
                <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-wide gradient-text">
                  JavStash
                </h1>
                <p className="text-xs tracking-[0.25em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
                  中文翻译代理
                </p>
              </div>
            </div>

            {/* 介绍 */}
            <p className="leading-relaxed text-base max-w-md" style={{ color: 'var(--text-secondary)' }}>
              本站是{' '}
              <a
                href="https://javstash.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline transition-colors"
                style={{ color: 'var(--accent-gold)' }}
              >
                JavStash
                <ExternalLink className="w-3 h-3" />
              </a>
              {' '}的中转代理，自动将日文元数据翻译为中文。
            </p>

            {/* 端点信息 - 用排版强调，不用框 */}
            <div className="space-y-4">
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
                代理端点
              </div>
              <div
                className="group flex items-center gap-4 cursor-pointer"
                onClick={handleCopy}
              >
                <code className="text-xl lg:text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {endpointUrl}
                </code>
                <button
                  type="button"
                  className="p-2 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"
                  style={{
                    background: copied ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    color: copied ? '#22c55e' : 'var(--text-muted)',
                  }}
                  title={copied ? '已复制' : '点击复制'}
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm pt-2" style={{ color: 'var(--text-muted)' }}>
                <span>获取 API Key</span>
                <span className="opacity-40">·</span>
                <a
                  href="https://discord.gg/javstash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline font-medium"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  Discord
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* 右侧：登录框 - 唯一焦点 */}
          <div className="lg:ml-auto lg:max-w-sm w-full">
            <div className="p-8 rounded-2xl" style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
            }}>
              {/* 登录方式选择 */}
              <div className="flex mb-6 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>

                <button
                  type="button"
                  onClick={() => setLoginType('javstash')}
                  className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200"
                  style={{
                    background: loginType === 'javstash' ? 'var(--bg-secondary)' : 'transparent',
                    color: loginType === 'javstash' ? 'var(--accent-gold)' : 'var(--text-muted)',
                    boxShadow: loginType === 'javstash' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  JavStash
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('admin')}
                  className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200"
                  style={{
                    background: loginType === 'admin' ? 'var(--bg-secondary)' : 'transparent',
                    color: loginType === 'admin' ? 'var(--accent-gold)' : 'var(--text-muted)',
                    boxShadow: loginType === 'admin' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  管理员
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field text-base py-3"
                    placeholder={loginType === 'admin' ? '请输入管理员密码' : '请输入 API Key'}
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm mb-4 text-center" style={{ color: '#ef4444' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
                >
                  {loading ? '登录中...' : (
                    <>
                      登录
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="h-px w-full" style={{
        background: 'linear-gradient(90deg, transparent, var(--border-light), transparent)'
      }} />
    </div>
  );
}
