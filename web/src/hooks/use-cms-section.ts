'use client';

import { useEffect, useRef, useState } from 'react';
import { CmsSectionKey } from '@/types/cms';

interface CmsSectionResponse {
  key: CmsSectionKey;
  lang: 'en' | 'zh';
  content: Record<string, unknown>;
}

export function useCmsSection(
  sectionKey: CmsSectionKey,
  lang: 'en' | 'zh',
  fallback: Record<string, unknown>
): Record<string, unknown> {
  const [content, setContent] = useState<Record<string, unknown>>(fallback);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  useEffect(() => {
    let cancelled = false;
    setContent(fallbackRef.current);

    async function loadCmsContent() {
      try {
        const res = await fetch(
          `/api/cms/section?key=${sectionKey}&lang=${lang}`,
          {
            cache: 'no-store',
          }
        );

        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as CmsSectionResponse;

        if (!cancelled && data?.content && typeof data.content === 'object') {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Failed to load cms section:', error);
      }
    }

    loadCmsContent();

    return () => {
      cancelled = true;
    };
  }, [sectionKey, lang]);

  return content;
}
