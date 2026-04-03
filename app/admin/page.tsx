'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from '@/components/sidebar';
import type { SceneData } from '@/src/graphql/queries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SearchBar,
  Pagination,
  DetailModal,
  ItemCard,
  type Translation,
  type ListResult,
  type SortBy,
  type AdminViewMode,
  ViewToggle,
  AdminRemoteSearchModal,
  fetchAdminRemoteSearchResults,
  shouldApplyAdminSearchResponse,
  prepareRemoteSearchFallbackState,
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
  // 当前视图模式
  const [viewMode, setViewMode] = useState<AdminViewMode>('table');
  // 实际执行的搜索关键词
  const [search, setSearch] = useState('');
  // 搜索输入框的值（未提交时）
  const [searchInput, setSearchInput] = useState('');
  // 数据加载状态
  const [loading, setLoading] = useState(true);
  // 远端搜索弹窗是否打开
  const [remoteOpen, setRemoteOpen] = useState(false);
  // 远端搜索关键词
  const [remoteKeyword, setRemoteKeyword] = useState('');
  // 远端搜索结果
  const [remoteResults, setRemoteResults] = useState<SceneData[]>([]);
  // 远端搜索加载状态
  const [remoteLoading, setRemoteLoading] = useState(false);
  // 远端搜索错误信息
  const [remoteError, setRemoteError] = useState('');
  // 当前选中的条目（用于详情弹窗）
  const [selected, setSelected] = useState<Translation | null>(null);
  // 当前详情是否只读（远端结果）
  const [selectedReadOnly, setSelectedReadOnly] = useState(false);
  // 操作提示消息
  const [message, setMessage] = useState('');
  // 本地查询请求版本
  const localRequestVersionRef = useRef(0);
  // 消息清除定时器
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  /**
   * 获取翻译列表数据
   * 根据页码、搜索关键词和排序方式请求后端 API
   */
  const fetchData = useCallback(async () => {
    const requestId = localRequestVersionRef.current + 1;
    localRequestVersionRef.current = requestId;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/translations?${params}`);
      if (!shouldApplyAdminSearchResponse({
        requestId,
        activeRequestId: localRequestVersionRef.current,
      })) {
        return;
      }

      if (res.ok) {
        const data: ListResult = await res.json();
        setItems(data.items);
        setTotal(data.total);
        const fallbackState = prepareRemoteSearchFallbackState(search, data.items);
        if (!fallbackState.open) {
          setRemoteResults([]);
          setRemoteError('');
          setRemoteLoading(false);
        }
        setRemoteOpen(fallbackState.open);
        setRemoteKeyword(fallbackState.keyword);
      }
    } catch {
      if (!shouldApplyAdminSearchResponse({
        requestId,
        activeRequestId: localRequestVersionRef.current,
      })) {
        return;
      }
      showMessage('获取数据失败');
    } finally {
      if (shouldApplyAdminSearchResponse({
        requestId,
        activeRequestId: localRequestVersionRef.current,
      })) {
        setLoading(false);
      }
    }
  }, [page, pageSize, search, sortBy]);

  // 页码或搜索关键词变化时重新获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!remoteOpen || !remoteKeyword) {
      setRemoteLoading(false);
      setRemoteError('');
      if (!remoteOpen) {
        setRemoteResults([]);
      }
      return () => {
        cancelled = true;
      };
    }

    setRemoteLoading(true);
    setRemoteError('');
    setRemoteResults([]);

    fetchAdminRemoteSearchResults(remoteKeyword)
      .then(({ results, error }) => {
        if (cancelled) {
          return;
        }
        setRemoteResults(results);
        setRemoteError(error);
      })
      .finally(() => {
        if (!cancelled) {
          setRemoteLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [remoteOpen, remoteKeyword]);

  /**
   * 显示操作提示消息
   * 3 秒后自动消失
   */
  const showMessage = (msg: string) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage(msg);
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      messageTimeoutRef.current = null;
    }, 3000);
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

  const handleLocalSelect = (item: Translation) => {
    setSelectedReadOnly(false);
    setSelected(item);
  };

  const handleRemoteSelect = (item: Translation) => {
    setSelectedReadOnly(true);
    setSelected(item);
  };

  const handleDetailClose = () => {
    setSelected(null);
    setSelectedReadOnly(false);
  };

  const handleRemoteClose = () => {
    setRemoteOpen(false);
    setRemoteKeyword('');
    setRemoteResults([]);
    setRemoteError('');
    setRemoteLoading(false);
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
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <ViewToggle value={viewMode} onChange={setViewMode} />
            {/* 排序选择 */}
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as SortBy);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">按修改时间</SelectItem>
                <SelectItem value="code">按番号首字母</SelectItem>
              </SelectContent>
            </Select>
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border-light)', borderTopColor: 'var(--accent-gold)' }}
              />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              暂无数据
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                        代码
                      </th>
                      <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                        中文标题
                      </th>
                      <th className="text-left px-3 py-2 font-medium hidden lg:table-cell w-full" style={{ color: 'var(--text-muted)' }}>
                        中文简介
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <ItemCard
                        key={item.code}
                        item={item}
                        variant="table"
                        onClick={handleLocalSelect}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 xl:grid-cols-5">
                  {items.map((item) => (
                    <ItemCard
                      key={item.code}
                      item={item}
                      variant="grid"
                      onClick={handleLocalSelect}
                    />
                  ))}
                </div>
              )}
            </>
          )}
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

        <AdminRemoteSearchModal
          open={remoteOpen}
          keyword={remoteKeyword}
          results={remoteResults}
          loading={remoteLoading}
          error={remoteError}
          onClose={handleRemoteClose}
          onSelect={handleRemoteSelect}
        />

        {/* 详情弹窗 */}
        {selected && (
          <DetailModal
            item={selected}
            onClose={handleDetailClose}
            onUpdate={selectedReadOnly ? undefined : handleUpdate}
            onDelete={selectedReadOnly ? undefined : handleDelete}
            readOnly={selectedReadOnly}
          />
        )}
      </main>
    </div>
  );
}
