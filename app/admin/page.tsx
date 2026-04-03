'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import type { SceneData } from '@/src/graphql/queries';
import {
  AdminPageHeader,
  Pagination,
  DetailModal,
  ItemCard,
  type Translation,
  type ListResult,
  type SortBy,
  type PageSize,
  type AdminViewMode,
  AdminRemoteSearchModal,
  createAdminListSearchParams,
  fetchAdminLocalSearchResults,
  fetchAdminRemoteSearchResults,
  readAdminListState,
  shouldApplyAdminSearchResponse,
  shouldDisableAdminBackgroundInteractions,
  prepareRemoteSearchFallbackState,
  writeAdminListPreferences,
} from './_components';

/**
 * 缓存管理页面
 * 提供翻译缓存的查看、搜索、编辑和删除功能
 */
export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const readCurrentListState = () =>
    readAdminListState({
      searchParams,
      storage: typeof window === 'undefined' ? null : window.localStorage,
    });

  // 翻译列表数据
  const [items, setItems] = useState<Translation[]>([]);
  // 数据总量（用于分页计算）
  const [total, setTotal] = useState(0);
  // 当前页码
  const [page, setPage] = useState(() => readCurrentListState().page);
  // 每页条数
  const [pageSize, setPageSize] = useState(() => readCurrentListState().pageSize);
  // 排序方式
  const [sortBy, setSortBy] = useState<SortBy>(() => readCurrentListState().sortBy);
  // 当前视图模式
  const [viewMode, setViewMode] = useState<AdminViewMode>(() => readCurrentListState().viewMode);
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
  // 本地搜索结果（在搜索弹框里显示）
  const [localSearchResults, setLocalSearchResults] = useState<Translation[]>([]);
  // 远端搜索加载状态
  const [remoteLoading, setRemoteLoading] = useState(false);
  // 远端搜索错误信息
  const [remoteError, setRemoteError] = useState('');
  // 搜索结果来源
  const [searchSource, setSearchSource] = useState<'local' | 'remote' | null>(null);
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
  const backgroundInteractionDisabled = shouldDisableAdminBackgroundInteractions(remoteOpen);

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
  }, [page, pageSize, sortBy]);

  // 页码或搜索关键词变化时重新获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const nextState = readCurrentListState();

    setPage((current) => (current === nextState.page ? current : nextState.page));
    setPageSize((current) => (current === nextState.pageSize ? current : nextState.pageSize));
    setSortBy((current) => (current === nextState.sortBy ? current : nextState.sortBy));
    setViewMode((current) => (current === nextState.viewMode ? current : nextState.viewMode));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = createAdminListSearchParams({
      page,
      pageSize,
      sortBy,
      viewMode,
    });
    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }

    writeAdminListPreferences(typeof window === 'undefined' ? null : window.localStorage, {
      pageSize,
      sortBy,
      viewMode,
    });
  }, [page, pageSize, sortBy, viewMode, pathname, router, searchParams]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

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
  const handleSearch = async () => {
    if (backgroundInteractionDisabled) {
      return;
    }
    const keyword = searchInput.trim();
    if (!keyword) {
      return;
    }

    setRemoteOpen(true);
    setRemoteKeyword(keyword);
    setRemoteLoading(true);
    setRemoteError('');
    setRemoteResults([]);
    setLocalSearchResults([]);
    setSearchSource(null);

    try {
      const localResults = await fetchAdminLocalSearchResults(keyword);
      const fallbackState = prepareRemoteSearchFallbackState(keyword, localResults);

      if (!fallbackState.open) {
        setSearchSource('local');
        setLocalSearchResults(localResults);
        setRemoteLoading(false);
        return;
      }

      setSearchSource('remote');
      const remoteResult = await fetchAdminRemoteSearchResults(fallbackState.keyword);
      setRemoteResults(remoteResult.results);
      setRemoteError(remoteResult.error);
    } catch {
      setSearchSource('remote');
      setRemoteError('请求失败，请重试');
    } finally {
      setRemoteLoading(false);
    }
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
    if (backgroundInteractionDisabled) {
      return;
    }
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
    setLocalSearchResults([]);
    setRemoteResults([]);
    setRemoteError('');
    setRemoteLoading(false);
    setSearchSource(null);
  };

  return (
    <div className="min-h-screen flex animated-bg">
      <Sidebar />
      <main className="flex-1 p-6 relative z-10">
        <AdminPageHeader
          total={total}
          sortBy={sortBy}
          viewMode={viewMode}
          searchInput={searchInput}
          backgroundInteractionDisabled={backgroundInteractionDisabled}
          onSortChange={(value) => {
            setSortBy(value);
            setPage(1);
          }}
          onViewModeChange={setViewMode}
          onSearchInputChange={setSearchInput}
          onSearch={handleSearch}
        />

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
        <div
          className={`glass-card animate-fade-in stagger-1 overflow-hidden ${backgroundInteractionDisabled ? 'opacity-60' : ''}`}
          aria-hidden={backgroundInteractionDisabled}
        >
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
            disabled={backgroundInteractionDisabled}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size as PageSize);
              setPage(1);
            }}
          />
        </div>

        <AdminRemoteSearchModal
          open={remoteOpen}
          keyword={remoteKeyword}
          source={searchSource}
          localResults={localSearchResults}
          results={remoteResults}
          loading={remoteLoading}
          error={remoteError}
          onClose={handleRemoteClose}
          onLocalSelect={handleLocalSelect}
          onRemoteSelect={handleRemoteSelect}
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
