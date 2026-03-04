export const CMS_SECTION_KEYS = [
  'navbar',
  'hero',
  'who_i_help',
  'services',
  'how_it_works',
  'why_choose_me',
  'testimonials',
  'pricing',
  'faq',
  'final_cta',
  'privacy_policy',
  'terms_of_service',
] as const;

export type CmsSectionKey = (typeof CMS_SECTION_KEYS)[number];

export type CmsLocale = 'en' | 'zh';

export interface CmsSectionRow {
  section_key: CmsSectionKey;
  draft_content_en: Record<string, unknown>;
  draft_content_zh: Record<string, unknown>;
  published_content_en: Record<string, unknown>;
  published_content_zh: Record<string, unknown>;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}
