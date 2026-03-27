import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '缓存管理',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
