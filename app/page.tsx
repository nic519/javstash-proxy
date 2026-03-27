'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ArrowDownRight, ExternalLink } from 'lucide-react';

type LoginType = 'admin' | 'javstash';

/**
 * JavStash Proxy - Unified Dark Theme Landing
 */
export default function HomePage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('javstash');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const endpointUrl = 'https://javstash.vercel.app/api/graphql';

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const page = Math.round(scrollY / windowHeight);
      setCurrentPage(Math.min(page, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPage = (page: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    window.scrollTo({
      top: page * window.innerHeight,
      behavior: 'smooth'
    });

    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpointUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // silent fail
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
      invalid_credentials: '密码错误',
      javstash_invalid: 'API Key 无效',
      network_error: '网络错误',
    };
    return messages[errorCode] || '登录失败';
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
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative animated-bg">
      {/* Cinematic Background */}
      <div className="fixed inset-0 -z-10">

        {/* Gold atmospheric overlay - matching accent-gold */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% 0%, rgba(212, 175, 55, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse 80% 50% at 100% 100%, rgba(184, 150, 47, 0.25) 0%, transparent 50%)
            `
          }}
        />
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Page Navigation - Gold accent */}
      <nav className="fixed right-6 lg:right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
        {[0, 1].map((page) => (
          <button
            key={page}
            onClick={() => scrollToPage(page)}
            className="group relative cursor-pointer"
            aria-label={`第${page + 1}页`}
          >
            <span
              className={`block w-1.5 transition-all duration-500 ${currentPage === page
                ? 'h-12'
                : 'h-6 bg-white/20 group-hover:bg-white/40'
                }`}
              style={{
                borderRadius: '1px',
                background: currentPage === page ? 'var(--accent-gold)' : undefined
              }}
            />
          </button>
        ))}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          PAGE 01 - THE REVEAL
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className={`min-h-screen snap-start snap-always flex items-center justify-center px-6 lg:px-16 transition-opacity duration-700 ${currentPage === 0 ? 'opacity-100' : 'opacity-60'
          }`}
      >
        <div className="w-full max-w-6xl">
          {/* Asymmetric Layout */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left Column - Brand */}
            <div className="lg:col-span-5 space-y-8">
              {/* Logo Mark */}
              <div className="relative inline-block">
                <img
                  src="/logo2.png"
                  alt=""
                  className="w-38 h-43"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-t border-r" style={{ borderColor: 'var(--border-gold)' }} />
              </div>

              {/* Title Stack */}
              <div className="space-y-4">
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[0.9] gradient-text">
                  JavStash
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium tracking-wider uppercase" style={{ color: 'var(--accent-gold)' }}>
                    中文翻译代理
                  </span>
                  <span className="w-12 h-px" style={{ background: 'linear-gradient(to right, var(--accent-gold), transparent)' }} />
                </div>
              </div>

              {/* Mission Statement */}
              <p className="text-lg leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                为 Stash 提供 JavStash 数据源的中文翻译代理服务，自动将日文元数据转换为中文。
              </p>

              {/* CTA */}
              <button
                onClick={() => scrollToPage(1)}
                className="group inline-flex items-center gap-3 transition-colors duration-300 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <span className="text-sm tracking-[0.2em] uppercase group-hover:text-[var(--text-primary)]">调试工具</span>
                <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" style={{ color: 'var(--accent-gold)' }} />
              </button>
            </div>

            {/* Right Column - Endpoint Display */}
            <div className="lg:col-span-7 relative">
              {/* Decorative Frame */}
              <div className="absolute -inset-6 border rounded-sm pointer-events-none" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l" style={{ borderColor: 'var(--border-gold)' }} />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r" style={{ borderColor: 'var(--border-gold)' }} />

              {/* Endpoint Card */}
              <div
                onClick={handleCopy}
                className="group relative cursor-pointer glass-card p-8 lg:p-12 hover:shadow-[var(--shadow-gold)]"
              >
                {/* Label */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: 'var(--accent-gold)' }}>
                    GraphQL Endpoint
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: copied ? '#22c55e' : 'var(--accent-gold-dark)' }} />
                    <span className={`text-[11px] tracking-[0.2em] uppercase ${copied ? 'text-emerald-400' : ''
                      }`} style={{ color: copied ? undefined : 'var(--text-muted)' }}>
                      {copied ? '已复制' : '点击复制'}
                    </span>
                  </div>
                </div>

                {/* URL */}
                <code className="block text-xl sm:text-2xl lg:text-3xl font-light tracking-wide leading-relaxed font-mono break-all" style={{ color: 'var(--text-primary)' }}>
                  {endpointUrl}
                </code>

                {/* Copy Icon */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {copied ? (
                    <Check className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Copy className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>

              {/* Usage Note */}
              <div className="mt-8 flex items-start gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="w-8 h-px mt-3 shrink-0" style={{ background: 'var(--border-light)' }} />
                <p>
                  在 Stash 设置中将原 JavStash 端点地址替换为上方地址即可使用。
                  API Key 保持不变。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PAGE 02 - THE SANCTUARY
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className={`min-h-screen snap-start snap-always flex items-center justify-center px-6 lg:px-16 transition-opacity duration-700 ${currentPage === 1 ? 'opacity-100' : 'opacity-60'
          }`}
      >
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-8 h-px" style={{ background: 'var(--border-light)' }} />
              <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: 'var(--text-muted)' }}>可选功能</span>
              <span className="w-8 h-px" style={{ background: 'var(--border-light)' }} />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-4 gradient-text">
              在线调试
            </h2>
            <p className="leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
              图形化界面调试接口。非必要功能
            </p>
          </div>

          {/* Login Form */}
          <div className="relative">
            {/* Decorative corner */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l" style={{ borderColor: 'var(--border-gold)' }} />

            <form
              onSubmit={handleSubmit}
              className="glass-card p-8 space-y-6"
            >
              {/* Login Type Toggle */}
              <div className="flex border" style={{ borderColor: 'var(--border-subtle)' }}>
                {[
                  { key: 'javstash' as const, label: 'API Key' },
                  { key: 'admin' as const, label: '管理员' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLoginType(key)}
                    className={`flex-1 py-3 text-sm font-medium transition-all duration-300 cursor-pointer ${loginType === key
                      ? 'text-[var(--text-primary)]'
                      : ''
                      }`}
                    style={{
                      background: loginType === key ? 'var(--bg-tertiary)' : 'transparent',
                      color: loginType === key ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 text-sm font-mono focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder={loginType === 'admin' ? '密码' : 'API Key'}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-4 text-sm font-medium tracking-wider uppercase transition-all duration-300 cursor-pointer btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                    验证中
                  </span>
                ) : '进入调试'}
              </button>

              {/* Error */}
              {error && (
                <p className="text-sm text-center py-2 border-t" style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  {error}
                </p>
              )}
            </form>
          </div>

          {/* Footer Links */}
          <footer className="mt-12 flex items-center justify-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <a
              href="https://discord.gg/javstash"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              获取 API Key
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/</span>
            <a
              href="https://github.com/stashapp/stash"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors cursor-pointer hover:text-[var(--text-secondary)]"
            >
              Stash
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </footer>
        </div>
      </section>
    </div>
  );
}