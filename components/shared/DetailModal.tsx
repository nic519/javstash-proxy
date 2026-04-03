'use client';

import { Pencil, Trash2, X, Loader2 } from 'lucide-react';
import type { DetailModalProps } from './types';
import { DetailView, EditFormView, IconButton, useDetailModal } from './detail-modal';

/**
 * 详情弹窗组件
 * 支持查看和编辑两种模式，可预览封面图片
 */
export function DetailModal({ item, onClose, onHydrate, onUpdate, onDelete, readOnly }: DetailModalProps) {
  const {
    copied,
    deleting,
    editing,
    form,
    rawData,
    rawDataLoading,
    saving,
    setEditing,
    setForm,
    handleCopyCode,
    handleDelete,
    handleSave,
  } = useDetailModal({ item, onHydrate, onUpdate, onDelete });

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
            className="flex items-center justify-between px-6 pt-4 cursor-default"
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
            <div
              className="inline-flex items-center overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
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
                  <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <IconButton
                    onClick={handleDelete}
                    disabled={deleting}
                    color="#ef4444"
                    hoverColor="rgba(239,68,68,0.15)"
                    title="删除"
                  >
                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </IconButton>
                  <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
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
export { getPerformerNames } from './detail-modal';
