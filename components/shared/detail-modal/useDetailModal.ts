'use client';

import { useEffect, useState } from 'react';
import type { PerformerData, SceneData } from '@/src/graphql/queries';
import type { DetailModalProps, EditForm } from '../types';
import { copySceneCode } from '../SceneMeta';
import {
  hydrateMissingPerformerDetails,
  parseSceneData,
  performerHasExtraDetails,
  type PerformerPanelStatus,
} from './helpers';

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
  const [performerStatusById, setPerformerStatusById] = useState<Record<string, PerformerPanelStatus>>({});
  const [form, setForm] = useState<EditForm>({
    titleZh: item.titleZh,
    summaryZh: item.summaryZh,
    coverUrl: item.coverUrl || '',
    rawResponse: item.rawResponse || '',
  });

  useEffect(() => {
    setEditing(false);
    setSaving(false);
    setDeleting(false);
    setCopied(false);
    setPerformerStatusById({});
    setForm({
      titleZh: item.titleZh,
      summaryZh: item.summaryZh,
      coverUrl: item.coverUrl || '',
      rawResponse: item.rawResponse || '',
    });
  }, [item.code, item.coverUrl, item.rawResponse, item.summaryZh, item.titleZh]);

  useEffect(() => {
    const baseRawData = item.rawResponse ? parseSceneData(item.rawResponse) : null;
    setRawData(baseRawData);

    if (!baseRawData) {
      setPerformerStatusById({});
      return;
    }

    let cancelled = false;
    const initialStatuses = Object.fromEntries(
      (baseRawData.performers ?? [])
        .map((entry) => entry.performer)
        .filter((performer): performer is PerformerData => Boolean(performer?.id))
        .map((performer) => [
          performer.id as string,
          performerHasExtraDetails(performer) ? 'ready' : 'loading',
        ] satisfies [string, PerformerPanelStatus])
    );
    setPerformerStatusById(initialStatuses);

    const fetchPerformerById = async (id: string): Promise<PerformerData | null> => {
      const response = await fetch(`/api/performers/${encodeURIComponent(id)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch performer ${id}`);
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        performer?: PerformerData | null;
        error?: string;
      };

      if (!payload.ok) {
        throw new Error(payload.error || `Failed to fetch performer ${id}`);
      }

      const performer = payload.performer ?? null;

      if (!cancelled) {
        setPerformerStatusById((current) => ({
          ...current,
          [id]: performer && performerHasExtraDetails(performer) ? 'ready' : 'missing',
        }));
      }

      return performer;
    };

    hydrateMissingPerformerDetails(baseRawData, fetchPerformerById)
      .then((enriched) => {
        if (!cancelled && enriched) {
          setRawData(enriched);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          const missingIds = (baseRawData.performers ?? [])
            .map((entry) => entry.performer)
            .filter((performer): performer is PerformerData => Boolean(performer?.id))
            .filter((performer) => !performerHasExtraDetails(performer))
            .map((performer) => performer.id as string);
          setPerformerStatusById((current) => ({
            ...current,
            ...Object.fromEntries(missingIds.map((id) => [id, 'error' satisfies PerformerPanelStatus])),
          }));
        }
        console.error('Failed to enrich performer details', error);
      });

    return () => {
      cancelled = true;
    };
  }, [item.rawResponse]);

  const handleCopyCode = async () => {
    await copySceneCode(item.code);
    setCopied(true);
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
        onUpdate({
          ...item,
          ...form,
          coverUrl: form.coverUrl || undefined,
          rawResponse: form.rawResponse || undefined,
        });
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
    performerStatusById,
    rawData,
    saving,
    setEditing,
    setForm,
    handleCopyCode,
    handleDelete,
    handleSave,
  };
}
