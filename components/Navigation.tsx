'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Code, Database, Layers, LogOut, Menu, X } from 'lucide-react';
import { getNextDesktopNavVisibility } from './navigation-scroll';

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

interface NavigationProps {
  scrollContainerId?: string;
}

export function Navigation({ scrollContainerId }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopVisible, setDesktopVisible] = useState(true);
  const lastScrollTopRef = useRef(0);
  const desktopVisibleRef = useRef(true);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    desktopVisibleRef.current = desktopVisible;
  }, [desktopVisible]);

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

  useEffect(() => {
    setDesktopVisible(true);
    desktopVisibleRef.current = true;
    lastScrollTopRef.current = 0;

    if (!scrollContainerId) {
      return;
    }

    const scrollContainer = document.getElementById(scrollContainerId);

    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => {
      const currentScrollTop = scrollContainer.scrollTop;
      const nextVisible = getNextDesktopNavVisibility({
        currentScrollTop,
        lastScrollTop: lastScrollTopRef.current,
        isVisible: desktopVisibleRef.current,
      });

      lastScrollTopRef.current = currentScrollTop;
      setDesktopVisible((current) => (current === nextVisible ? current : nextVisible));
    };

    handleScroll();
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerId]);

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
          className={`group relative inline-flex items-center gap-2.5 rounded-full text-sm font-medium transition-all duration-300 ${mobile ? 'px-4 py-3' : 'px-4 py-2.5'}`}
          style={{
            background: mobile
              ? isActive
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.22), rgba(201, 162, 39, 0.08))'
                : 'rgba(255,255,255,0.02)'
              : isActive
                ? 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))'
                : 'transparent',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            width: mobile ? '100%' : undefined,
            justifyContent: mobile ? 'flex-start' : undefined,
            border: mobile || isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            boxShadow:
              isActive && !mobile
                ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 26px rgba(0,0,0,0.26)'
                : undefined,
          }}
        >
          {!mobile && isActive ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: '0 0 0 1px rgba(201, 162, 39, 0.22), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            />
          ) : null}

          {!mobile && isActive ? (
            <span
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-5 w-px -translate-y-1/2"
              style={{
                background: 'linear-gradient(180deg, rgba(201, 162, 39, 0), rgba(201, 162, 39, 0.85), rgba(201, 162, 39, 0))',
              }}
            />
          ) : null}

          <span
            className="relative z-10 transition-transform duration-200 group-hover:scale-110"
            style={{ color: isActive ? 'var(--accent-gold)' : undefined }}
          >
            {iconMap[item.icon]}
          </span>
          <span className="relative z-10 tracking-[0.01em]">{item.label}</span>
        </Link>
      );
    });

  const brandBlock = (
    <Link href="/" className="group inline-flex items-center gap-3.5">
      <div
        className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.25rem] border"
        style={{
          background:
            'linear-gradient(145deg, rgba(201, 162, 39, 0.22), rgba(201, 162, 39, 0.08) 45%, rgba(255,255,255,0.04) 100%)',
          borderColor: 'rgba(201, 162, 39, 0.22)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-[1px] rounded-[1.15rem]"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), rgba(255,255,255,0) 48%), linear-gradient(180deg, rgba(18, 18, 22, 0.25), rgba(10,10,14,0.08))',
          }}
        />
        <Layers className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" style={{ color: 'var(--accent-gold-light)' }} />
      </div>
      <div className="min-w-0">
        <div className="font-display text-[1.05rem] font-semibold tracking-[0.08em] uppercase gradient-text">
          JavStash
        </div>
        <div className="text-[0.7rem] uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
          Translation Console
        </div>
      </div>
    </Link>
  );

  const desktopNavigationShell = (
    <header
      className="hidden lg:flex sticky top-0 z-40 px-6 py-4"
      style={{
        background:
          'linear-gradient(180deg, rgba(6, 6, 8, 0.86), rgba(6, 6, 8, 0.48) 82%, rgba(6, 6, 8, 0))',
      }}
    >
      <div
        className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-5 rounded-[1.9rem] border px-5 py-3.5"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,20,24,0.86), rgba(12,12,16,0.72))',
          borderColor: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          boxShadow:
            '0 22px 50px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(201, 162, 39, 0.08)',
        }}
      >
        <div className="justify-self-start">
          {brandBlock}
        </div>

        <nav
          aria-label="主导航"
          className="justify-self-center rounded-full border p-1.5"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,8,10,0.82), rgba(18,18,24,0.66))',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 30px rgba(0,0,0,0.22)',
          }}
        >
          <div className="flex items-center gap-1.5">
            {renderNavItems({ mobile: false })}
          </div>
        </nav>

        <div className="justify-self-end">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
            style={{
              color: '#f1b5b5',
              background: 'linear-gradient(180deg, rgba(84, 25, 25, 0.24), rgba(60, 14, 14, 0.16))',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {iconMap.logout}
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </header>
  );

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
            <div onClick={() => setMobileOpen(false)}>
              {brandBlock}
            </div>
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

      {scrollContainerId ? (
        <div
          data-scroll-target={scrollContainerId}
          className={`hidden lg:block shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${desktopVisible ? 'max-h-28 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-3'}`}
        >
          {desktopNavigationShell}
        </div>
      ) : (
        desktopNavigationShell
      )}
    </>
  );
}
