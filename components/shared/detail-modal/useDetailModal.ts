'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { SceneData } from '@/src/graphql/queries';
import type { DetailModalProps, EditForm } from '../types';
import { parseSceneData } from './helpers';

export function useDetailModal({
  item,
  onUpdate,
  onDelete,
}: Pick<DetailModalProps, 'item' | 'onUpdate' | 'onDelete'>) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rawData, setRawData] = useState<SceneData | null>(() =>
    item.rawResponse ? parseSceneData(item.rawResponse) : null
  );
  const [form, setForm] = useState<EditForm>({
    titleZh: item.titleZh,
    summaryZh: item.summaryZh,
    coverUrl: item.coverUrl || '',
  });

  useEffect(() => {
    setEditing(false);
    setSaving(false);
    setDeleting(false);
    setCopied(false);
    setForm({
      titleZh: item.titleZh,
      summaryZh: item.summaryZh,
      coverUrl: item.coverUrl || '',
    });
  }, [item.code, item.coverUrl, item.summaryZh, item.titleZh]);

  useEffect(() => {
    setRawData(item.rawResponse ? parseSceneData(item.rawResponse) : null);
  }, [item.rawResponse]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(item.code);
    setCopied(true);
    toast.success('番号已复制', {
      id: `scene-copy-${item.code}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

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
        onUpdate({ ...item, ...form, coverUrl: form.coverUrl || undefined });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

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

  return {
    copied,
    deleting,
    editing,
    form,
    rawData,
    saving,
    setEditing,
    setForm,
    handleCopyCode,
    handleDelete,
    handleSave,
  };
}
