import { NextRequest, NextResponse } from 'next/server';
import { getPublishedCmsSection } from '@/lib/cms';
import { CMS_SECTION_KEYS, CmsLocale, CmsSectionKey } from '@/types/cms';

function isValidSectionKey(value: string): value is CmsSectionKey {
  return CMS_SECTION_KEYS.includes(value as CmsSectionKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') || '';
    const lang = searchParams.get('lang') === 'zh' ? 'zh' : 'en';

    if (!isValidSectionKey(key)) {
      return NextResponse.json({ error: 'Invalid cms section key' }, { status: 400 });
    }

    const content = await getPublishedCmsSection(key, lang as CmsLocale);

    return NextResponse.json({
      key,
      lang,
      content,
    });
  } catch (error) {
    console.error('Failed to fetch cms section:', error);
    return NextResponse.json({ error: 'Failed to fetch cms section' }, { status: 500 });
  }
}
