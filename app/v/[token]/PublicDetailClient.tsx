'use client';

import { useState } from 'react';
import { DetailView } from '@/components/shared/detail-modal';
import { parseSceneData } from '@/components/shared/detail-modal/helpers';
import type { Translation } from '@/components/shared/types';

export function PublicDetailClient({
  translation,
}: {
  translation: Translation;
}) {
  const [copied, setCopied] = useState(false);
  const rawData = translation.rawResponse ? parseSceneData(translation.rawResponse) : null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(translation.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <DetailView
      item={translation}
      form={{
        titleZh: translation.titleZh,
        summaryZh: translation.summaryZh,
        coverUrl: translation.coverUrl || '',
        rawResponse: translation.rawResponse || '',
      }}
      onClose={() => {}}
      onCopyCode={handleCopyCode}
      copied={copied}
      rawData={rawData}
      showUserTags={false}
    />
  );
}
