'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Code, Database, Layers, LogOut, Menu, X } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/admin', label: '数据浏览', icon: 'database' },
  { href: '/playground', label: 'GraphQL 测试', icon: 'code' },
];

const iconMap: Record<string, React.ReactNode> = {
  code: <Code className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
};

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setMobileOpen(false);
    router.push('/');
  };

  const renderNavItems = ({ mobile = false }: { mobile?: boolean }) =>
    navItems.map((item) => {
      const isActive = pathname === item.href;

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className="group relative inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
            width: mobile ? '100%' : undefined,
            justifyContent: mobile ? 'flex-start' : undefined,
          }}
        >
          <span className="transition-transform duration-200 group-hover:scale-110">
            {iconMap[item.icon]}
          </span>
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? '关闭导航菜单' : '打开导航菜单'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((current) => !current)}
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-300 lg:hidden"
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          background: mobileOpen ? 'var(--accent-gold)' : 'rgba(15, 15, 18, 0.92)',
          color: mobileOpen ? 'var(--bg-primary)' : 'var(--accent-gold)',
          boxShadow: mobileOpen ? 'var(--shadow-gold)' : 'var(--shadow-md)',
        }}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="关闭导航遮罩"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(8, 8, 10, 0.72)', backdropFilter: 'blur(6px)' }}
        />

        <aside
          className={`absolute right-0 top-0 flex h-dvh w-72 max-w-[82vw] flex-col transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{
            background: 'rgba(15, 15, 18, 0.96)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="border-b px-6 py-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
                  boxShadow: 'var(--shadow-gold)',
                }}
              >
                <Layers className="h-5 w-5" style={{ color: 'var(--bg-primary)' }} />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold tracking-wide gradient-text">JavStash</h1>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Navigation</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {renderNavItems({ mobile: true })}
          </nav>

          <div className="border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleLogout}
              className="inline-flex w-full items-center gap-2.5 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
              style={{ color: '#ef4444' }}
            >
              {iconMap.logout}
              <span>退出登录</span>
            </button>
          </div>
        </aside>
      </div>

      <header
        className="hidden lg:flex sticky top-0 z-40 items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(10, 10, 14, 0.72)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              <Layers className="h-5 w-5" style={{ color: 'var(--bg-primary)' }} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-wide gradient-text">JavStash</h1>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Navigation</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {renderNavItems({ mobile: false })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
          style={{ color: '#ef4444' }}
        >
          {iconMap.logout}
          <span>退出登录</span>
        </button>
      </header>
    </>
  );
}
