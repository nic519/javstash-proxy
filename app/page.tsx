import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">GraphQL API</h3>
            <p className="text-gray-600 mb-4">测试 GraphQL 查询和变更</p>
            <Link href="/playground" className="text-blue-600 hover:underline">
              前往 Playground →
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">数据浏览</h3>
            <p className="text-gray-600 mb-4">搜索和浏览 JavStash 数据</p>
            <Link href="/browse" className="text-blue-600 hover:underline">
              开始浏览 →
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">缓存管理</h3>
            <p className="text-gray-600 mb-4">查看统计和清除翻译缓存</p>
            <Link href="/admin" className="text-blue-600 hover:underline">
              管理缓存 →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
