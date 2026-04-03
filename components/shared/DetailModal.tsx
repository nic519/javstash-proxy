'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, X, Loader2, Image as ImageIcon, Check, Copy, Users, CalendarDays, Hash, Clapperboard, Tags } from 'lucide-react';
import type { DetailModalProps, EditForm } from './types';
import type { SceneData } from '@/src/graphql/queries';

/**
 * 详情弹窗组件
 * 支持查看和编辑两种模式，可预览封面图片
 */
export function DetailModal({ item, onClose, onUpdate, onDelete, readOnly }: DetailModalProps) {
  // 编辑模式状态
  const [editing, setEditing] = useState(false);
  // 保存中状态
  const [saving, setSaving] = useState(false);
  // 删除中状态
  const [deleting, setDeleting] = useState(false);
  // 复制成功状态
  const [copied, setCopied] = useState(false);
  // 原始数据状态
  const [rawData, setRawData] = useState<SceneData | null>(null);
  const [rawDataLoading, setRawDataLoading] = useState(false);
  // 编辑表单数据
  const [form, setForm] = useState<EditForm>({
    titleZh: item.titleZh,
    summaryZh: item.summaryZh,
    coverUrl: item.coverUrl || '',
  });

  // 当 item 变化时，尝试从 rawResponse 解析或获取原始数据
  useEffect(() => {
    const parseSceneData = (jsonStr: string): SceneData | null => {
      try {
        const parsed = JSON.parse(jsonStr);
        // 如果是数组格式,视为无效数据,返回 null 触发重新请求
        if (Array.isArray(parsed)) {
          return null;
        }
        return parsed as SceneData;
      } catch {
        return null;
      }
    };

    const parsedData = item.rawResponse ? parseSceneData(item.rawResponse) : null;

    if (parsedData) {
      setRawData(parsedData);
    } else {
      // 没有 rawResponse 或格式无效,从 API 获取
      setRawDataLoading(true);
      fetch(`/api/admin/scenes/${encodeURIComponent(item.code)}/raw`)
        .then((res) => res.json())
        .then((data) => {
          if (data.rawResponse) {
            setRawData(parseSceneData(data.rawResponse));
          } else {
            setRawData(null);
          }
        })
        .catch(() => setRawData(null))
        .finally(() => setRawDataLoading(false));
    }
  }, [item.code, item.rawResponse]);

  /**
   * 复制 code 到剪贴板
   */
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * 保存编辑内容
   * 调用 API 更新翻译缓存
   */
  const handleSave = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/translations/${encodeURIComponent(item.code)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        // 更新成功后同步更新父组件状态
        onUpdate({ ...item, ...form, coverUrl: form.coverUrl || undefined });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * 删除当前条目
   * 需要用户确认后调用 API 删除
   */
  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm(`确定要删除 ${item.code} 吗？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/translations/${encodeURIComponent(item.code)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDelete(item.code);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* 背景遮罩:点击关闭 */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.1)' }}
        onClick={onClose}
      />

      {/* 弹窗主体 */}
      <div
        className="absolute inset-0 flex justify-center items-center"
        onClick={onClose}
      >
        <div
          className="flex flex-col my-4 mx-4 max-w-7xl w-full rounded-2xl overflow-hidden animate-scale-in cursor-pointer"
          style={{
            background: 'rgba(15, 15, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 25px 80px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1)',
            maxHeight: 'min(680px, calc(100vh - 2rem))',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 顶部栏:标题和操作按钮 */}
          <div
            className="flex items-center justify-between px-6 py-4 cursor-default"
            style={{
              background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.8) 0%, transparent 100%)',
              borderBottom: '1px solid var(--border-color)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-6 rounded-full"
                style={{ background: 'var(--accent-gold)' }}
              />
              {form.titleZh && (
                <h2
                  className="font-medium text-lg"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  {form.titleZh}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* 只在非只读模式下显示编辑和删除按钮 */}
              {!readOnly && (
                <>
                  <IconButton
                    onClick={() => setEditing(!editing)}
                    color="var(--accent-gold)"
                    hoverColor="rgba(212,175,55,0.15)"
                    title="编辑"
                  >
                    <Pencil className="w-5 h-5" />
                  </IconButton>
                  <IconButton
                    onClick={handleDelete}
                    disabled={deleting}
                    color="#ef4444"
                    hoverColor="rgba(239,68,68,0.15)"
                    title="删除"
                  >
                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </IconButton>
                  <div className="w-px h-5 mx-1" style={{ background: 'var(--border-color)' }} />
                </>
              )}
              <IconButton
                onClick={onClose}
                color="var(--text-muted)"
                hoverColor="var(--bg-tertiary)"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </IconButton>
            </div>
          </div>

          {/* 内容区域 */}
          <div
            className="flex-1 overflow-y-auto p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {editing && !readOnly ? (
              <EditFormView
                form={form}
                onChange={setForm}
                onSave={handleSave}
                onCancel={() => setEditing(false)}
                saving={saving}
              />
            ) : (
              <DetailView
                item={item}
                form={form}
                onClose={onClose}
                onCopyCode={handleCopyCode}
                copied={copied}
                rawData={rawData}
                rawDataLoading={rawDataLoading}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ==================== 子组件 ==================== */

/**
 * 图标按钮
 * 统一的图标按钮样式
 */
function IconButton({
  onClick,
  disabled,
  color,
  hoverColor,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  hoverColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-xl transition-all duration-200 disabled:opacity-40 hover:scale-105 active:scale-95"
      style={{ color, backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      title={title}
    >
      {children}
    </button>
  );
}

/**
 * 格式化日期
 */
function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  } catch {
    return dateStr;
  }
}

/**
 * 格式化时长(分钟)
 */
function formatDuration(minutes?: number): string | null {
  if (!minutes) return null;
  return `${minutes} 分钟`;
}

export function getPerformerNames(rawData: SceneData | null): string[] {
  if (!Array.isArray(rawData?.performers)) return [];

  return rawData.performers
    .map((entry) => entry.performer?.name?.trim())
    .filter((name): name is string => Boolean(name));
}

/**
 * 详情视图
 * 左侧展示封面大图,右侧展示文字信息
 */
function DetailView({
  item,
  form,
  onClose,
  onCopyCode,
  copied,
  rawData,
  rawDataLoading,
}: {
  item: DetailModalProps['item'];
  form: EditForm;
  onClose: () => void;
  onCopyCode: () => void;
  copied: boolean;
  rawData: SceneData | null;
  rawDataLoading: boolean;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const performerNames = getPerformerNames(rawData);
  const releaseDate = rawData ? formatDate(rawData.date) : null;
  const studioName =
    rawData?.studio && typeof rawData.studio === 'object' && 'name' in rawData.studio && typeof rawData.studio.name === 'string'
      ? rawData.studio.name
      : null;

  return (
    <div className="flex gap-10 max-w-6xl mx-auto">
      {/* 封面大图区域 - 固定尺寸占位 */}
      <div className="flex-shrink-0">
        <div
          className="relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
          style={{
            width: 540,
            height: 360,
            maxHeight: '70vh',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4), 0 0 30px -5px rgba(212,175,55,0.15)',
            background: 'var(--bg-tertiary)',
          }}
          onClick={onClose}
        >
          {form.coverUrl ? (
            <>
              {/* 加载占位符 */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
              <Image
                src={form.coverUrl}
                alt={item.code}
                width={600}
                height={400}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                unoptimized
                onLoad={() => setImageLoading(false)}
              />
              {/* 底部渐变 */}
              <div
                className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
        </div>
      </div>
      {/* 文字信息区域 */}
      <div className="flex-1 space-y-6 min-w-0 self-start">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              onClick={onCopyCode}
              className="flex items-center gap-2 group cursor-pointer"
              title="点击复制"
            >
              <Hash
                className="w-4 h-4 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-sm whitespace-nowrap"
                style={{ color: 'var(--accent-gold)' }}
              >
                {item.code}
              </span>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
              )}
            </button>

            {releaseDate && (
              <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <CalendarDays
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  aria-hidden="true"
                />
                <span className="text-sm whitespace-nowrap">{releaseDate}</span>
              </div>
            )}

            {studioName && (
              <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Clapperboard
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  aria-hidden="true"
                />
                <span className="text-sm whitespace-nowrap">{studioName}</span>
              </div>
            )}
          </div>

          {performerNames.length > 0 && (
            <div className="flex items-start gap-3">
              <Users
                className="w-4 h-4 mt-1 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <div className="flex flex-wrap gap-2">
                {performerNames.map((name) => (
                  <span
                    key={name}
                    className="inline-block px-2 py-1 text-xs rounded"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="whitespace-pre-wrap leading-relaxed">{form.summaryZh || '-'}</p>

        {/* 原始数据区域 */}
        {rawDataLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>正在加载原始数据...</span>
          </div>
        ) : rawData ? (
          <>

            {/* 基本信息 - 2列布局 */}
            <div className="grid grid-cols-3 gap-4">
              {typeof rawData.director === 'string' && rawData.director && (
                <div
                  className="text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>导演：</span>
                  <span>{rawData.director}</span>
                </div>
              )}
            </div>

            {/* 标签 - 跨列显示 */}
            {Array.isArray(rawData.tags) && rawData.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <Tags
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap gap-2">
                  {rawData.tags.slice(0, 8).map((tag: { name?: string }, idx: number) => (
                    tag.name && (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 text-xs rounded"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {tag.name}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 编辑表单视图
 * 提供标题、简介、封面 URL 的编辑输入
 */
function EditFormView({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  form: EditForm;
  onChange: (form: EditForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <InputField
        label="中文标题"
        value={form.titleZh}
        onChange={(v) => onChange({ ...form, titleZh: v })}
      />
      <TextAreaField
        label="中文简介"
        value={form.summaryZh}
        onChange={(v) => onChange({ ...form, summaryZh: v })}
        rows={6}
      />
      <InputField
        label="封面 URL"
        value={form.coverUrl}
        onChange={(v) => onChange({ ...form, coverUrl: v })}
      />
      {/* 操作按钮组 */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
        >
          取消
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center gap-2"
          style={{
            background: 'var(--accent-gold)',
            color: 'var(--bg-primary)',
            boxShadow: '0 4px 15px -3px rgba(212,175,55,0.4)',
          }}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          保存
        </button>
      </div>
    </div>
  );
}

/**
 * 只读字段展示
 */
function Field({
  label,
  highlight,
  className,
  children,
}: {
  label: string;
  highlight?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`group ${className || ''}`}>
 <label
        className="block text-xs font-medium tracking-wide uppercase mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <div
        className={`transition-colors ${highlight ? '' : ''}`}
        style={{ color: highlight ? 'var(--accent-gold)' : 'var(--text-primary)' }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 单行输入字段
 */
function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium tracking-wide uppercase mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm rounded-xl border-none outline-none transition-all focus:ring-2"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px var(--accent-gold)')}
        onBlur={(e) => (e.target.style.boxShadow = 'none')}
      />
    </div>
  );
}

/**
 * 多行文本输入字段
 */
function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium tracking-wide uppercase mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-2.5 text-sm rounded-xl border-none outline-none resize-none transition-all leading-relaxed"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px var(--accent-gold)')}
        onBlur={(e) => (e.target.style.boxShadow = 'none')}
      />
    </div>
  );
}
