'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/sidebar';

interface Translation {
  code: string;
  titleZh: string;
  summaryZh: string;
  coverUrl?: string;
}

interface ListResult {
  items: Translation[];
  total: number;
}

export default function AdminPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Translation | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ titleZh: '', summaryZh: '', coverUrl: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/translations?${params}`);
      if (res.ok) {
        const data: ListResult = await res.json();
        setTranslations(data.items);
        setTotal(data.total);
      }
    } catch {
      setMessage('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const openDetail = (t: Translation) => {
    setSelected(t);
    setEditForm({
      titleZh: t.titleZh,
      summaryZh: t.summaryZh,
      coverUrl: t.coverUrl || '',
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/translations/${encodeURIComponent(selected.code)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setMessage('保存成功');
        setSelected({ ...selected, ...editForm, coverUrl: editForm.coverUrl || undefined });
        fetchTranslations();
      } else {
        setMessage('保存失败');
      }
    } catch {
      setMessage('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !confirm(`确定要删除 ${selected.code} 吗？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/translations/${encodeURIComponent(selected.code)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessage('删除成功');
        setSelected(null);
        fetchTranslations();
      } else {
        setMessage('删除失败');
      }
    } catch {
      setMessage('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex animated-bg">
      <Sidebar />
      <main className="flex-1 p-6 relative z-10">
        {/* Header + Search */}
        <div className="flex items-center justify-between mb-4 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-semibold gradient-text">缓存管理</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total.toLocaleString()} 条</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索..."
              className="w-48 px-3 py-1.5 text-sm rounded-lg border-none outline-none"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            />
            <button onClick={handleSearch} className="p-1.5 rounded-lg transition-colors" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Message */}
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

        {/* Table */}
        <div className="glass-card animate-fade-in stagger-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-light)', borderTopColor: 'var(--accent-gold)' }} />
            </div>
          ) : translations.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>暂无数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>代码</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>中文标题</th>
                    <th className="text-left px-3 py-2 font-medium hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>中文简介</th>
                  </tr>
                </thead>
                <tbody>
                  {translations.map((t) => (
                    <tr
                      key={t.code}
                      onClick={() => openDetail(t)}
                      className="cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="px-3 py-2">
                        <span className="font-mono whitespace-nowrap" style={{ color: 'var(--accent-gold)' }}>{t.code}</span>
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <p className="truncate" style={{ color: 'var(--text-primary)' }}>{t.titleZh || '-'}</p>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <p className="truncate max-w-md" style={{ color: 'var(--text-secondary)' }}>{t.summaryZh || '-'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded transition-colors disabled:opacity-50" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded transition-colors disabled:opacity-50" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-5 animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono font-medium text-lg" style={{ color: 'var(--accent-gold)' }}>{selected.code}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(!editing)} className="p-1.5 rounded-lg transition-colors hover:bg-amber-500/10" style={{ color: 'var(--accent-gold)' }} title="编辑">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: '#ef4444' }} title="删除">
                    {deleting ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-muted)' }} title="关闭">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              {selected.coverUrl && (
                <div className="mb-4">
                  <img
                    src={selected.coverUrl}
                    alt={selected.code}
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              )}

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>中文标题</label>
                    <input
                      type="text"
                      value={editForm.titleZh}
                      onChange={(e) => setEditForm({ ...editForm, titleZh: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border-none outline-none"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>中文简介</label>
                    <textarea
                      value={editForm.summaryZh}
                      onChange={(e) => setEditForm({ ...editForm, summaryZh: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border-none outline-none resize-none"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>封面 URL</label>
                    <input
                      type="text"
                      value={editForm.coverUrl}
                      onChange={(e) => setEditForm({ ...editForm, coverUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border-none outline-none"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                      取消
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1" style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}>
                      {saving && <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>中文标题</label>
                    <p style={{ color: 'var(--text-primary)' }}>{selected.titleZh || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>中文简介</label>
                    <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{selected.summaryZh || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>封面 URL</label>
                    {selected.coverUrl ? (
                      <a href={selected.coverUrl} target="_blank" rel="noopener noreferrer" className="text-sm break-all hover:underline" style={{ color: '#3b82f6' }}>
                        {selected.coverUrl}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
