'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Code, Database, LogOut, Layers } from 'lucide-react';

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
  code: <Code className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  logout: <LogOut className="w-5 h-5" />,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-72 h-screen shrink-0 sticky top-0 flex flex-col relative" style={{ background: 'var(--bg-secondary)' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
            boxShadow: 'var(--shadow-gold)'
          }}>
            <Layers className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-wide gradient-text">
              JavStash
            </h1>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Proxy Server</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
        <div className="mb-4">
          <span className="text-xs font-medium uppercase tracking-wider px-4" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative"
              style={{
                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: 'var(--accent-gold)' }}
                />
              )}
              <span className="transition-transform duration-200 group-hover:scale-110">
                {iconMap[item.icon]}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={async () => {
            await fetch('/api/auth', { method: 'DELETE' });
            router.push('/');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10"
          style={{ color: '#ef4444' }}
        >
          {iconMap.logout}
          <span className="font-medium">退出登录</span>
        </button>
      </div>

      {/* Decorative Gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(to top, var(--bg-primary), transparent)',
        }}
      />
    </aside>
  );
}
