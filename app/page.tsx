'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { Copy, Check, ArrowDownRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { isSignedIn } = useAuth();
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
                在 Stash 设置中将 JavStash 端点替换为上方地址即可，继续使用你现有的 JavStash ApiKey 访问上游。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          PAGE 02 - DEBUG ACCESS
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
              使用 Clerk 账号进入控制台与 GraphQL 调试工具
            </p>
          </div>

          <div
            className="rounded-2xl border p-6 space-y-6"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <div className="space-y-3">
              <div className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>
                Account Access
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                登录后即可访问数据浏览与 Playground。管理员账号会自动获得编辑和删除权限。
              </p>
            </div>

            {isSignedIn ? (
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="w-full h-11 text-sm font-semibold tracking-[0.1em] uppercase rounded-lg transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
                    color: 'var(--bg-primary)'
                  }}
                >
                  进入控制台
                </Button>

                <div
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div>
                    <div className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--text-muted)' }}>
                      Account
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      已登录，可前往数据浏览与 Playground
                    </div>
                  </div>
                  <UserButton />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <SignUpButton mode="modal">
                  <Button
                    type="button"
                    className="w-full h-11 text-sm font-semibold tracking-[0.1em] uppercase rounded-lg transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
                      color: 'var(--bg-primary)'
                    }}
                  >
                    注册后进入调试
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 text-sm font-semibold tracking-[0.08em] uppercase rounded-lg border transition-all duration-300"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    已有账号登录
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <footer className="mt-8 flex items-center justify-center gap-5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a
              href="https://discord.gg/javstash"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors duration-300 cursor-pointer hover:text-[var(--accent-gold)]"
            >
              通过 Discord 申请上游 ApiKey
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
