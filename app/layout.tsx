import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JavStash Proxy',
  description: 'GraphQL proxy with translation',
};

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
