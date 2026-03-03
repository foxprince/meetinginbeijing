import { content } from '@/config/content';
import { CmsLocale, CmsSectionKey } from '@/types/cms';

export function getDefaultCmsSectionContent(
  sectionKey: CmsSectionKey,
  locale: CmsLocale
): Record<string, unknown> {
  const langContent = content[locale];

  if (sectionKey === 'navbar') {
    return {
      brand_title: 'MeetingInBeijing',
      brand_subtitle: 'Your Beijing Companion',
      cta_text: langContent.nav.cta,
    };
  }

  if (sectionKey === 'who_i_help') {
    return {
      title: langContent.whoIHelp.title,
      description: langContent.whoIHelp.description,
      items: langContent.whoIHelp.items,
    };
  }

  return {
    title: langContent.pricing.title,
    disclaimer: langContent.pricing.disclaimer,
    items: langContent.pricing.items,
    transparent_text:
      locale === 'zh' ? '透明收费，无隐藏费用' : 'Transparent & No hidden fees',
  };
}
