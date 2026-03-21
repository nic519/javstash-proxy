'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { DetailModalProps, EditForm } from './types';

/**
 * 详情弹窗组件
 * 支持查看和编辑两种模式，可预览封面图片
 */
export function DetailModal({ item, onClose, onUpdate, onDelete }: DetailModalProps) {
  // 编辑模式状态
  const [editing, setEditing] = useState(false);
  // 保存中状态
  const [saving, setSaving] = useState(false);
  // 删除中状态
  const [deleting, setDeleting] = useState(false);
  // 全屏图片查看状态
  const [showLightbox, setShowLightbox] = useState(false);
  // 编辑表单数据
  const [form, setForm] = useState<EditForm>({
    titleZh: item.titleZh,
    summaryZh: item.summaryZh,
    coverUrl: item.coverUrl || '',
  });

  /**
   * 保存编辑内容
   * 调用 API 更新翻译缓存
   */
  const handleSave = async () => {
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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* 顶部栏：标题和操作按钮 */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-mono font-medium text-xl" style={{ color: 'var(--accent-gold)' }}>
          {item.code}
        </h3>
        <div className="flex items-center gap-1">
          {/* 编辑按钮：切换编辑模式 */}
          <IconButton
            onClick={() => setEditing(!editing)}
            color="var(--accent-gold)"
            hoverColor="rgba(212,175,55,0.1)"
            title="编辑"
          >
            <EditIcon />
          </IconButton>
          {/* 删除按钮 */}
          <IconButton
            onClick={handleDelete}
            disabled={deleting}
            color="#ef4444"
            hoverColor="rgba(239,68,68,0.1)"
            title="删除"
          >
            {deleting ? <SpinnerIcon /> : <TrashIcon />}
          </IconButton>
          {/* 关闭按钮 */}
          <IconButton
            onClick={onClose}
            color="var(--text-muted)"
            hoverColor="var(--bg-tertiary)"
            title="关闭"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {editing ? (
          <EditFormView
            form={form}
            onChange={setForm}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
            saving={saving}
          />
        ) : (
          <DetailView item={item} form={form} />
        )}
      </div>
      </div>
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
      className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
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
 * 详情视图
 * 左侧展示封面缩略图，右侧展示文字信息
 */
function DetailView({
  item,
  form,
  onImageClick,
}: {
  item: DetailModalProps['item'];
  form: EditForm;
  onImageClick: () => void;
}) {
  return (
    <div className="flex gap-5">
      {/* 封面缩略图：点击可全屏查看 */}
      {form.coverUrl && (
        <div
          className="flex-shrink-0 cursor-pointer group"
          onClick={onImageClick}
        >
          <Image
            src={form.coverUrl}
            alt={item.code}
            width={160}
            height={240}
            className="w-40 h-auto rounded-lg object-cover shadow-lg transition-transform group-hover:scale-105"
            unoptimized
          />
          <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>
            点击查看大图
          </p>
        </div>
      )}
      {/* 文字信息区域 */}
      <div className="flex-1 space-y-3 min-w-0">
        <Field label="中文标题">{form.titleZh || '-'}</Field>
        <Field label="中文简介">
          {/* 保留换行格式 */}
          <p className="whitespace-pre-wrap">{form.summaryZh || '-'}</p>
        </Field>
        <Field label="封面 URL">
          {form.coverUrl ? (
            <a
              href={form.coverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all hover:underline"
              style={{ color: '#3b82f6' }}
            >
              {form.coverUrl}
            </a>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>-</span>
          )}
        </Field>
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
    <div className="space-y-3">
      <InputField
        label="中文标题"
        value={form.titleZh}
        onChange={(v) => onChange({ ...form, titleZh: v })}
      />
      <TextAreaField
        label="中文简介"
        value={form.summaryZh}
        onChange={(v) => onChange({ ...form, summaryZh: v })}
        rows={5}
      />
      <InputField
        label="封面 URL"
        value={form.coverUrl}
        onChange={(v) => onChange({ ...form, coverUrl: v })}
      />
      {/* 操作按钮组 */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-lg"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          取消
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1"
          style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}
        >
          {saving && <SpinnerIcon size={3} />}
          保存
        </button>
      </div>
    </div>
  );
}

/**
 * 只读字段展示
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <div style={{ color: 'var(--text-primary)' }}>{children}</div>
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
      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 text-sm rounded-lg border-none outline-none"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
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
      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-1.5 text-sm rounded-lg border-none outline-none resize-none"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      />
    </div>
  );
}

/* ==================== 全屏图片组件 ==================== */

/**
 * 全屏图片查看器
 * 点击任意位置关闭
 */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 cursor-zoom-out"
      onClick={onClose}
    >
      {/* 关闭提示 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        点击任意位置关闭
      </div>
      {/* 图片 */}
      <Image
        src={src}
        alt={alt}
        width={800}
        height={1200}
        className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain"
        unoptimized
      />
    </div>
  );
}

/* ==================== 图标组件 ==================== */

/** 编辑图标 */
function EditIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

/** 删除图标 */
function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

/** 关闭图标 */
function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/** 加载旋转图标 */
function SpinnerIcon({ size = 5 }: { size?: number }) {
  return (
    <svg className={`w-${size} h-${size} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
