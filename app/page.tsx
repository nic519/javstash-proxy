'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ArrowDownRight, ExternalLink, KeyRound, Shield } from 'lucide-react';
import Magnet from '@/components/Magnet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type LoginType = 'admin' | 'javstash';

/**
 * JavStash Proxy - Luxury Dark Theme Landing
 *
 * Design Direction: Refined luxury with editorial typography
 * - Dark cinematic background with subtle gold accents
 * - Clean spatial hierarchy with generous breathing room
 * - Micro-interactions that feel intentional, not gratuitous
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
      {/* Atmospheric Background */}
      <div className="fixed inset-0 -z-10">
        {/* Subtle gold glow from top */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 50% at 50% -20%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 90% 100%, rgba(184, 150, 47, 0.05) 0%, transparent 50%)
            `
          }}
        />
        {/* Fine grain texture */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Minimal Page Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1].map((page) => (
          <button
            key={page}
            onClick={() => scrollToPage(page)}
            className="group relative w-6 h-6 flex items-center justify-center cursor-pointer"
            aria-label={`第${page + 1}页`}
          >
            <span
              className={`block w-1 rounded-full transition-all duration-500 ${currentPage === page ? 'h-4' : 'h-1.5 bg-white/20 group-hover:bg-white/40'}`}
              style={{ background: currentPage === page ? 'var(--accent-gold)' : undefined }}
            />
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          PAGE 01 - ENDPOINT SHOWCASE
      ───────────────────────────────────────────────────────────────── */}
      <section
        className="min-h-screen snap-start snap-always flex items-center justify-center px-6 lg:px-20"
      >
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Brand Identity */}
            <div className="space-y-10">
              {/* Logo */}
              <div className="relative inline-block">
                <img src="/logo2.png" alt="" className="w-32 h-auto" />
              </div>

              {/* Title */}
              <div className="space-y-5">
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[0.9] gradient-text">
                  JavStash
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium tracking-[0.15em] uppercase" style={{ color: 'var(--accent-gold)' }}>
                    中文翻译代理
                  </span>
                  <span className="w-10 h-px" style={{ background: 'linear-gradient(to right, var(--accent-gold), transparent)' }} />
                </div>
              </div>

              {/* Description */}
              <p className="text-lg leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                为 Stash 提供 JavStash 数据源的中文翻译代理，自动将日文元数据转换为中文显示。
              </p>

              {/* CTA */}
              <button
                onClick={() => scrollToPage(1)}
                className="group inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase transition-colors duration-300 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <span className="group-hover:text-[var(--text-primary)] transition-colors">调试工具</span>
                <ArrowDownRight
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"
                  style={{ color: 'var(--accent-gold)' }}
                />
              </button>
            </div>

            {/* Right: Endpoint Card */}
            <div className="space-y-6">
              {/* Card */}
              <div
                onClick={handleCopy}
                className="group relative cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 hover:border-[var(--border-light)]"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                {/* Subtle hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%)'
                  }}
                />

                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] tracking-[0.25em] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>
                    GraphQL Endpoint
                  </span>

                  {/* Copy Status - Clear separation from icon */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                      style={{ background: copied ? '#22c55e' : 'var(--accent-gold-dark)' }}
                    />
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase transition-colors duration-300"
                      style={{ color: copied ? '#22c55e' : 'var(--text-muted)' }}
                    >
                      {copied ? '已复制' : '点击卡片复制'}
                    </span>
                  </div>
                </div>

                {/* Card Body - URL */}
                <div className="relative px-6 py-8">
                  <code
                    className="block text-lg sm:text-xl lg:text-2xl font-light tracking-wide leading-relaxed font-mono break-all pr-12"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {endpointUrl}
                  </code>

                  {/* Copy Button - Separate, bottom-right */}
                  <div
                    className="absolute bottom-6 right-6 p-3 rounded-xl transition-all duration-300 group-hover:bg-[var(--bg-tertiary)]"
                    style={{ border: '1px solid var(--border-subtle)' }}
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Copy className="w-5 h-5 transition-colors" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Note */}
              <p className="text-sm leading-relaxed px-2" style={{ color: 'var(--text-muted)' }}>
                在 Stash 设置中将 JavStash 端点替换为上方地址即可，API Key 无需更改。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          PAGE 02 - DEBUG LOGIN
      ───────────────────────────────────────────────────────────────── */}
      <section
        className="min-h-screen snap-start snap-always flex items-center justify-center px-6 lg:px-20"
      >
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-6 h-px" style={{ background: 'var(--border-light)' }} />
              <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--text-muted)' }}>
                可选功能
              </span>
              <span className="w-6 h-px" style={{ background: 'var(--border-light)' }} />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-4 gradient-text">
              在线调试
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              图形化界面调试接口
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border p-6 space-y-6"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            {/* Login Type Tabs */}
            <Tabs
              value={loginType}
              onValueChange={(v) => setLoginType(v as LoginType)}
              className="w-full"
            >
              <TabsList
                className="w-full grid grid-cols-2 h-10 rounded-lg p-1"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                variant="default"
              >
                <TabsTrigger
                  value="javstash"
                  className="h-full rounded-md data-[active]:bg-[var(--bg-tertiary)] data-[active]:shadow-sm text-sm font-medium transition-all gap-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  API Key
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="h-full rounded-md data-[active]:bg-[var(--bg-tertiary)] data-[active]:shadow-sm text-sm font-medium transition-all gap-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  管理员
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Input */}
            <div className="space-y-2.5">
              <label
                className="text-[10px] tracking-[0.2em] uppercase font-medium block"
                style={{ color: 'var(--text-muted)' }}
              >
                {loginType === 'admin' ? '管理员密码' : 'JavStash API Key'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-4 text-sm font-mono rounded-lg transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
                placeholder={loginType === 'admin' ? '输入密码...' : '粘贴 API Key...'}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full h-11 text-sm font-semibold tracking-[0.1em] uppercase rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
                color: 'var(--bg-primary)'
              }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  验证中
                </span>
              ) : '进入调试'}
            </Button>

            {/* Error */}
            {error && (
              <div
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </form>

          {/* Footer Links */}
          <footer className="mt-8 flex items-center justify-center gap-5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a
              href="https://discord.gg/javstash"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors duration-300 cursor-pointer hover:text-[var(--accent-gold)]"
            >
              获取 API Key
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </a>
            <span style={{ color: 'var(--border-light)' }}>·</span>
            <a
              href="https://github.com/stashapp/stash"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors duration-300 cursor-pointer hover:text-[var(--accent-gold)]"
            >
              Stash
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </a>
          </footer>
        </div>
      </section>
    </div>
  );
}
