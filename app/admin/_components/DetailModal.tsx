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
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* 背景遮罩：点击关闭 */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      />

      {/* 弹窗主体 */}
      <div
        className="absolute inset-0 flex flex-col m-4 rounded-2xl overflow-hidden animate-scale-in cursor-pointer"
        style={{
          background: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 80px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1)',
        }}
        onClick={onClose}
      >
        {/* 顶部栏：标题和操作按钮 */}
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
            <h3
              className="font-mono text-sm tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.code}
            </h3>
            {form.titleZh && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <h2
                  className="font-medium text-lg"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  {form.titleZh}
                </h2>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => setEditing(!editing)}
              color="var(--accent-gold)"
              hoverColor="rgba(212,175,55,0.15)"
              title="编辑"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              disabled={deleting}
              color="#ef4444"
              hoverColor="rgba(239,68,68,0.15)"
              title="删除"
            >
              {deleting ? <SpinnerIcon /> : <TrashIcon />}
            </IconButton>
            <div className="w-px h-5 mx-1" style={{ background: 'var(--border-color)' }} />
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
        <div
          className="flex-1 overflow-y-auto p-6 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
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
 * 详情视图
 * 左侧展示封面大图，右侧展示文字信息
 */
function DetailView({ item, form }: { item: DetailModalProps['item']; form: EditForm }) {
  return (
    <div className="flex gap-10 max-w-6xl mx-auto">
      {/* 封面大图 */}
      {form.coverUrl && (
        <div className="flex-shrink-0">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4), 0 0 30px -5px rgba(212,175,55,0.15)',
            }}
          >
            <Image
              src={form.coverUrl}
              alt={item.code}
              width={400}
              height={600}
              className="max-h-[70vh] w-auto object-cover"
              unoptimized
            />
            {/* 底部渐变 */}
            <div
              className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }}
            />
          </div>
        </div>
      )}
      {/* 文字信息区域 */}
      <div className="flex-1 space-y-6 min-w-0 py-2">
        <Field label="中文简介">
          <p className="whitespace-pre-wrap leading-relaxed">{form.summaryZh || '-'}</p>
        </Field>
        <Field label="封面 URL">
          {form.coverUrl ? (
            <a
              href={form.coverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all hover:underline transition-colors"
              style={{ color: 'var(--accent-gold)' }}
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
          {saving && <SpinnerIcon size={4} />}
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
  children,
}: {
  label: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
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
