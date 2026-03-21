'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/browse', label: '数据浏览', icon: '🔍' },
  { href: '/playground', label: 'GraphQL 测试', icon: '🧪' },
  { href: '/admin', label: '缓存管理', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-8">🎬 JavStash Proxy</h1>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === item.href ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <form action="/api/auth" method="post" className="mt-auto">
        <input type="hidden" name="_method" value="DELETE" />
        <button
          type="submit"
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 text-red-400"
        >
          🚪 退出登录
        </button>
      </form>
    </aside>
  );
}
