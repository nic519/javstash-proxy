'use client';

import { DetailView, useDetailModal } from '@/components/shared/detail-modal';
import type { Translation } from '@/components/shared/types';

export function PublicDetailClient({
  translation,
}: {
  translation: Translation;
}) {
  const {
    copied,
    form,
    performerStatusById,
    rawData,
    handleCopyCode,
  } = useDetailModal({
    item: translation,
  });

  return (
    <DetailView
      item={translation}
      form={form}
      onClose={() => {}}
      onCopyCode={handleCopyCode}
      copied={copied}
      rawData={rawData}
      performerStatusById={performerStatusById}
      showUserTags={false}
    />
  );
}
