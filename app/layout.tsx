import type { Metadata } from 'next';
import './globals.css';

// 页面元数据配置
export const metadata: Metadata = {
  title: 'JavStash Proxy',
  description: 'GraphQL proxy with translation',
};

/**
 * 根布局组件
 * 所有页面的共享外层容器，设置语言和全局样式
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="antialiased" style={{ background: 'var(--bg-primary)' }}>
        {children}
      </body>
    </html>
  );
}
