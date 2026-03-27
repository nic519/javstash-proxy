'use client';

import { useEffect } from 'react';

const BASE_TITLE = 'JavStash';

/**
 * 动态设置页面标题
 * @param title 页面标题（不含站点名）
 * @example usePageTitle('搜索') // => "搜索 - JavStash Proxy"
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} - ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
