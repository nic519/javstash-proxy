'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Copy, Check } from 'lucide-react';

type LoginType = 'admin' | 'javstash';

/**
 * 首页 - 端点展示为主，登录为辅
 */
export default function HomePage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('javstash');
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
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
      {/* 背景纹理 */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* 顶部渐变光晕 */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] opacity-[0.03]" style={{
        background: 'radial-gradient(ellipse, var(--accent-gold) 0%, transparent 70%)',
      }} />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 relative z-10">
        <div className="max-w-4xl">
          {/* 品牌标识 */}
          <div className="flex items-end gap-6 mb-16 animate-fade-in">
            <img
              src="/logo.svg"
              alt="JavStash"
              className="w-28 h-28 lg:w-36 lg:h-36 object-contain"
            />
            <div className="flex flex-col gap-1 pb-2">
              <span className="font-display text-3xl lg:text-4xl font-medium tracking-wide" style={{ color: 'var(--text-primary)' }}>
                JavStash
              </span>
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: 'var(--text-muted)' }}>
                中文翻译代理
              </span>
            </div>
          </div>

          {/* 端点地址 - 视觉中心 */}
          <div className="mb-12 animate-fade-in stagger-1">
            <div className="text-xs tracking-[0.25em] uppercase mb-6" style={{ color: 'var(--text-muted)' }}>
              GraphQL Endpoint
            </div>

            {/* URL 展示卡片 */}
            <div
              className="group relative inline-flex items-center gap-6 cursor-pointer transition-all duration-300"
              onClick={handleCopy}
            >
              {/* 装饰性背景 */}
              <div className="absolute -inset-6 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.03), rgba(212, 175, 55, 0.01))',
                border: '1px solid rgba(212, 175, 55, 0.1)',
              }} />

              {/* URL 文字 */}
              <code className="relative text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight" style={{
                fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}>
                {endpointUrl}
              </code>

              {/* 复制按钮 */}
              <button
                type="button"
                className="relative p-3 rounded-xl transition-all duration-300 opacity-40 group-hover:opacity-100"
                style={{
                  background: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                  color: copied ? '#22c55e' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
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

            {/* 复制提示 */}
            <div className="mt-4 h-5 text-sm transition-opacity duration-300" style={{
              color: copied ? '#22c55e' : 'var(--text-muted)',
              opacity: copied ? 1 : 0,
            }}>
              已复制到剪贴板
            </div>
          </div>

          {/* 使用说明 */}
          <div className="mb-12 animate-fade-in stagger-2">
            <div className="text-xs tracking-[0.25em] uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
              Authentication
            </div>
            <p className="text-base mb-5" style={{ color: 'var(--text-secondary)' }}>
              请求需在 Header 中携带 API Key
            </p>
            {/* 代码示例 */}
            <div
              className="inline-block p-5 rounded-xl text-sm"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
              }}
            >
              <div style={{ color: 'var(--text-muted)' }}>fetch(<span style={{ color: 'var(--accent-gold)' }}>"{endpointUrl}"</span>, {'{'})</div>
              <div className="pl-4" style={{ color: 'var(--text-muted)' }}>
                headers: {'{\n'}
                <span className="pl-4" style={{ color: 'var(--text-secondary)' }}>"Content-Type"</span>: <span style={{ color: 'var(--accent-gold)' }}>"application/json"</span>,{'\n'}
                <span className="pl-4" style={{ color: 'var(--text-secondary)' }}>"ApiKey"</span>: <span style={{ color: 'var(--accent-gold)' }}>"your-api-key"</span>{'\n'}
                {'  }'}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>{'}'})</div>
            </div>
          </div>

          {/* 说明文字 */}
          <div className="max-w-lg animate-fade-in stagger-3">
            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              本站为{' '}
              <a
                href="https://javstash.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline transition-colors"
                style={{ color: 'var(--accent-gold)' }}
              >
                JavStash
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {' '}的中转代理，自动将日文元数据翻译为中文。
            </p>

            {/* API Key 获取 */}
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>获取 API Key 方式：</span>
              <a
                href="https://discord.gg/javstash"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center  hover:underline font-medium transition-colors"
                style={{ color: 'var(--accent-gold)' }}
              >
                Discord
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 登录入口 - 右上角 */}
      <div className="absolute top-8 right-8 z-20">
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* 提示文字 */}
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            登录后可图形化调试接口
          </p>

          {/* 登录方式选择 */}
          <div className="flex mb-3 rounded-md p-0.5" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              type="button"
              onClick={() => setLoginType('javstash')}
              className="flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all"
              style={{
                background: loginType === 'javstash' ? 'var(--bg-secondary)' : 'transparent',
                color: loginType === 'javstash' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              JavStash
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className="flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all"
              style={{
                background: loginType === 'admin' ? 'var(--bg-secondary)' : 'transparent',
                color: loginType === 'admin' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              管理员
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-sm py-2 flex-1"
              placeholder={loginType === 'admin' ? '密码' : 'API Key'}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0"
              style={{
                background: 'var(--accent-gold)',
                color: 'var(--bg-primary)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : '登录'}
            </button>
          </form>

          {error && (
            <p className="text-xs mt-2 text-center" style={{ color: '#ef4444' }}>{error}</p>
          )}
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="h-px w-full relative z-10" style={{
        background: 'linear-gradient(90deg, transparent, var(--border-subtle) 20%, var(--border-subtle) 80%, transparent)',
      }} />
    </div>
  );
}
