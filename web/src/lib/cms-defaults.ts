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

  if (sectionKey === 'hero') {
    return {
      title: langContent.hero.title,
      subtitle: langContent.hero.subtitle,
      primaryCTA: langContent.hero.primaryCTA,
      secondaryCTA: langContent.hero.secondaryCTA,
      trustPoints: langContent.hero.trustPoints,
      badges: langContent.hero.badges,
    };
  }

  if (sectionKey === 'who_i_help') {
    return {
      title: langContent.whoIHelp.title,
      description: langContent.whoIHelp.description,
      items: langContent.whoIHelp.items,
    };
  }

  if (sectionKey === 'services') {
    return {
      title: langContent.services.title,
      subtitle: langContent.services.subtitle,
      items: langContent.services.items,
    };
  }

  if (sectionKey === 'how_it_works') {
    return {
      title: langContent.howItWorks.title,
      steps: langContent.howItWorks.steps,
    };
  }

  if (sectionKey === 'pricing') {
    return {
      title: langContent.pricing.title,
      disclaimer: langContent.pricing.disclaimer,
      items: langContent.pricing.items,
      transparent_text:
        locale === 'zh' ? '透明收费，无隐藏费用' : 'Transparent & No hidden fees',
    };
  }

  return {};
}
