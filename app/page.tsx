import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';

const features = [
  {
    title: 'GraphQL API',
    description: '测试 GraphQL 查询和变更操作，探索完整的数据接口能力',
    href: '/playground',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    gradient: 'from-amber-500/20 to-orange-500/20',
    accentColor: '#f59e0b',
  },
  {
    title: '数据浏览',
    description: '搜索和浏览 JavStash 数据库中的所有内容，支持多维度查询',
    href: '/browse',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    gradient: 'from-blue-500/20 to-cyan-500/20',
    accentColor: '#3b82f6',
  },
  {
    title: '缓存管理',
    description: '查看系统统计信息，管理翻译缓存和数据同步状态',
    href: '/admin',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    gradient: 'from-emerald-500/20 to-teal-500/20',
    accentColor: '#10b981',
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex animated-bg">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="font-display text-4xl lg:text-5xl font-semibold mb-3 gradient-text">
            Dashboard
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            欢迎使用 JavStash Proxy 管理面板
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'API 状态', value: '运行中', status: 'active' },
            { label: '翻译服务', value: '就绪', status: 'active' },
            { label: '代理模式', value: '已启用', status: 'active' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`glass-card p-5 animate-fade-in stagger-${i + 1}`}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: stat.status === 'active' ? '#10b981' : '#ef4444' }}
                />
              </div>
              <p className="text-xl font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`glass-card group p-6 animate-fade-in stagger-${i + 2}`}
              style={{ minHeight: '200px' }}
            >
              {/* Icon Container */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${feature.gradient} transition-transform duration-300 group-hover:scale-110`}
                style={{ border: `1px solid ${feature.accentColor}30` }}
              >
                <span style={{ color: feature.accentColor }}>{feature.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 transition-colors duration-200 group-hover:text-[var(--accent-gold)]">
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Arrow */}
              <div className="mt-6 flex items-center gap-2 text-sm font-medium transition-all duration-200 group-hover:gap-3" style={{ color: feature.accentColor }}>
                <span>立即访问</span>
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <div className="divider mb-6" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            JavStash Proxy · GraphQL 代理服务 · 自动翻译功能
          </p>
        </div>
      </main>
    </div>
  );
}
