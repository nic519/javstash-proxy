'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { canManageAdminData, type SessionType } from '@/lib/session-permissions';
import {
  AdminPageControls,
  Pagination,
  DetailModal,
  ItemCard,
  AdminSearchResultsOverlay,
  type Translation,
  type ListResult,
  type SortBy,
  type PageSize,
  type AdminViewMode,
  applyAdminSearchOverlayState,
  createAdminListSearchParams,
  readAdminSearchOverlayState,
  readAdminListState,
  shouldApplyAdminSearchResponse,
  shouldDisableAdminBackgroundInteractions,
  writeAdminListPreferences,
} from './_components';

/**
 * 缓存管理页面
 * 提供翻译缓存的查看、搜索、编辑和删除功能
 */
export default function AdminPage() {
  const listScrollContainerId = 'admin-list-scroll-container';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const overlayState = readAdminSearchOverlayState(searchParams);
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
  // 随机列表模式
  const [randomMode, setRandomMode] = useState(false);
  // 随机列表刷新版本
  const [randomVersion, setRandomVersion] = useState(0);
  // 当前视图模式
  const [viewMode, setViewMode] = useState<AdminViewMode>(() => readCurrentListState().viewMode);
  // 搜索输入框的值（未提交时）
  const [searchInput, setSearchInput] = useState('');
  // 数据加载状态
  const [loading, setLoading] = useState(true);
  // 远端搜索弹窗是否打开
  const [remoteOpen, setRemoteOpen] = useState(() => overlayState.open);
  // 远端搜索关键词
  const [remoteKeyword, setRemoteKeyword] = useState(() => overlayState.keyword);
  // 当前选中的条目（用于详情弹窗）
  const [selected, setSelected] = useState<Translation | null>(null);
  // 当前详情是否只读（远端结果）
  const [selectedReadOnly, setSelectedReadOnly] = useState(false);
  // 当前会话类型
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  // 操作提示消息
  const [message, setMessage] = useState('');
  // 本地查询请求版本
  const localRequestVersionRef = useRef(0);
  // 消息清除定时器
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);
  const backgroundInteractionDisabled = shouldDisableAdminBackgroundInteractions(remoteOpen);
  const canManage = canManageAdminData(sessionType);

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
        pageSize: String(pageSize),
      });
      if (randomMode) {
        params.set('random', 'true');
        params.set('randomVersion', String(randomVersion));
      } else {
        params.set('page', String(page));
        params.set('sortBy', sortBy);
      }
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
  }, [page, pageSize, randomMode, randomVersion, sortBy]);

  // 页码或搜索关键词变化时重新获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const nextState = readCurrentListState();
    const nextOverlayState = readAdminSearchOverlayState(searchParams);

    setPage((current) => (current === nextState.page ? current : nextState.page));
    setPageSize((current) => (current === nextState.pageSize ? current : nextState.pageSize));
    setSortBy((current) => (current === nextState.sortBy ? current : nextState.sortBy));
    setViewMode((current) => (current === nextState.viewMode ? current : nextState.viewMode));
    setRemoteOpen((current) => (current === nextOverlayState.open ? current : nextOverlayState.open));
    setRemoteKeyword((current) =>
      current === nextOverlayState.keyword ? current : nextOverlayState.keyword
    );
    if (nextOverlayState.open) {
      setSearchInput((current) =>
        current === nextOverlayState.keyword ? current : nextOverlayState.keyword
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const nextParams = applyAdminSearchOverlayState(
      createAdminListSearchParams({
        page,
        pageSize,
        sortBy,
        viewMode,
      }),
      {
        open: overlayState.open,
        keyword: overlayState.keyword,
      }
    );
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
  }, [page, pageSize, sortBy, viewMode, pathname, router, searchParams, overlayState.open, overlayState.keyword]);

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

  useEffect(() => {
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        setSessionType(data.type ?? null);
      })
      .catch(() => {
        setSessionType(null);
      });
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
  const handleSearch = () => {
    if (backgroundInteractionDisabled) {
      return;
    }
    const keyword = searchInput.trim();
    if (!keyword) {
      return;
    }
    const nextParams = applyAdminSearchOverlayState(
      createAdminListSearchParams({
        page,
        pageSize,
        sortBy,
        viewMode,
      }),
      {
        open: true,
        keyword,
      }
    );

    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
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
    setSelectedReadOnly(!canManage);
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
    const nextParams = applyAdminSearchOverlayState(
      createAdminListSearchParams({
        page,
        pageSize,
        sortBy,
        viewMode,
      }),
      {
        open: false,
        keyword: '',
      }
    );

    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden animated-bg">
      <Navigation scrollContainerId={listScrollContainerId} />
      <main className="flex-1 min-h-0 overflow-hidden p-6 relative z-10">
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col lg:sticky lg:top-6 lg:max-h-[calc(100vh-8.5rem)]">
            <div className="min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
              <AdminPageControls
                sortBy={sortBy}
                randomMode={randomMode}
                viewMode={viewMode}
                searchInput={searchInput}
                backgroundInteractionDisabled={backgroundInteractionDisabled}
                onSortChange={(value) => {
                  setSortBy(value);
                  setPage(1);
                }}
                onRandomModeChange={(value) => {
                  setRandomMode(value);
                  setPage(1);
                  if (value) {
                    setRandomVersion((current) => current + 1);
                  }
                }}
                onRandomRefresh={() => {
                  setRandomVersion((current) => current + 1);
                }}
                onViewModeChange={setViewMode}
                onSearchInputChange={setSearchInput}
                onSearch={handleSearch}
              />
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-col gap-3">
            {/* 操作提示消息 */}
            {message && (
              <div
                className="px-3 py-1.5 rounded-lg text-sm animate-fade-in"
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
              className={`admin-list-canvas animate-fade-in stagger-1 flex min-h-0 flex-1 flex-col overflow-hidden ${backgroundInteractionDisabled ? 'opacity-60' : ''}`}
              aria-hidden={backgroundInteractionDisabled}
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.008) 18%, rgba(255,255,255,0.005) 100%)',
                boxShadow:
                  '0 24px 60px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.035)',
                borderRadius: '28px',
              }}
            >
              <div id={listScrollContainerId} className="min-h-0 flex-1 overflow-auto">
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
                ) : viewMode === 'table' ? (
                  <table className="w-full text-sm">
                    <thead
                      className="sticky top-0 z-10"
                      style={{
                        background: 'linear-gradient(180deg, rgba(15, 15, 18, 0.94), rgba(15, 15, 18, 0.78))',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
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
                  <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-3 xl:grid-cols-5">
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
              </div>

              {!randomMode ? (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={pageSize}
                  disabled={backgroundInteractionDisabled}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size as PageSize);
                    setPage(1);
                  }}
                />
              ) : null}
            </div>

            <AdminSearchResultsOverlay
              open={remoteOpen}
              keyword={remoteKeyword}
              onClose={handleRemoteClose}
              onLocalSelect={handleLocalSelect}
              onRemoteSelect={handleRemoteSelect}
            />

            {/* 详情弹窗 */}
            {selected && (
              <DetailModal
                item={selected}
                onClose={handleDetailClose}
                onUpdate={selectedReadOnly || !canManage ? undefined : handleUpdate}
                onDelete={selectedReadOnly || !canManage ? undefined : handleDelete}
                readOnly={selectedReadOnly || !canManage}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
