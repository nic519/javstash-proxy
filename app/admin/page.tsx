'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import {
  SearchBar,
  TranslationTable,
  Pagination,
  DetailModal,
  type Translation,
  type ListResult,
  type SortBy,
  PAGE_SIZE_OPTIONS,
} from './_components';

/**
 * 缓存管理页面
 * 提供翻译缓存的查看、搜索、编辑和删除功能
 */
export default function AdminPage() {
  // 翻译列表数据
  const [items, setItems] = useState<Translation[]>([]);
  // 数据总量（用于分页计算）
  const [total, setTotal] = useState(0);
  // 当前页码
  const [page, setPage] = useState(1);
  // 每页条数
  const [pageSize, setPageSize] = useState(20);
  // 排序方式
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  // 实际执行的搜索关键词
  const [search, setSearch] = useState('');
  // 搜索输入框的值（未提交时）
  const [searchInput, setSearchInput] = useState('');
  // 数据加载状态
  const [loading, setLoading] = useState(true);
  // 当前选中的条目（用于详情弹窗）
  const [selected, setSelected] = useState<Translation | null>(null);
  // 操作提示消息
  const [message, setMessage] = useState('');

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  /**
   * 获取翻译列表数据
   * 根据页码、搜索关键词和排序方式请求后端 API
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/translations?${params}`);
      if (res.ok) {
        const data: ListResult = await res.json();
        setItems(data.items);
        setTotal(data.total);
      }
    } catch {
      showMessage('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy]);

  // 页码或搜索关键词变化时重新获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 显示操作提示消息
   * 3 秒后自动消失
   */
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  /**
   * 执行搜索
   * 重置页码并更新搜索关键词
   */
  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  /**
   * 处理条目更新
   * 更新列表中对应条目的数据
   */
  const handleUpdate = (updated: Translation) => {
    setItems((prev) => prev.map((item) => (item.code === updated.code ? updated : item)));
    setSelected(updated);
    showMessage('保存成功');
  };

  /**
   * 处理条目删除
   * 从列表中移除已删除的条目
   */
  const handleDelete = (code: string) => {
    setItems((prev) => prev.filter((item) => item.code !== code));
    setSelected(null);
    showMessage('删除成功');
  };

  return (
    <div className="min-h-screen flex animated-bg">
      <Sidebar />
      <main className="flex-1 p-6 relative z-10">
        {/* 页面标题和搜索栏 */}
        <div className="flex items-center justify-between mb-4 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-semibold gradient-text">缓存管理</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {total.toLocaleString()} 条
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 排序选择 */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortBy);
                  setPage(1);
                }}
                className="text-sm px-2 py-1.5 rounded-lg focus:outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="updated">按修改时间</option>
                <option value="code">按番号首字母</option>
              </select>
            </div>
            <SearchBar value={searchInput} onChange={setSearchInput} onSearch={handleSearch} />
          </div>
        </div>

        {/* 操作提示消息 */}
        {message && (
          <div
            className="mb-3 px-3 py-1.5 rounded-lg text-sm animate-fade-in"
            style={{
              background: message.includes('失败') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              color: message.includes('失败') ? '#fca5a5' : '#86efac',
            }}
          >
            {message}
          </div>
        )}

        {/* 数据表格 */}
        <div className="glass-card animate-fade-in stagger-1 overflow-hidden">
          <TranslationTable
            items={items}
            loading={loading}
            onSelect={setSelected}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>

        {/* 详情弹窗 */}
        {selected && (
          <DetailModal
            item={selected}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
