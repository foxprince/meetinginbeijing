import { getDbClient } from '@/lib/db';
import { getDefaultCmsSectionContent } from '@/lib/cms-defaults';
import { CMS_SECTION_KEYS, CmsLocale, CmsSectionKey, CmsSectionRow } from '@/types/cms';

async function ensureCmsSchema(): Promise<void> {
  const client = await getDbClient();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_sections (
        section_key VARCHAR(100) PRIMARY KEY,
        draft_content_en JSONB NOT NULL DEFAULT '{}'::jsonb,
        draft_content_zh JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_content_en JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_content_zh JSONB NOT NULL DEFAULT '{}'::jsonb,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP WITH TIME ZONE
      );
    `);
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_cms_sections_status ON cms_sections(status);'
    );
  } finally {
    client.release();
  }
}

function parseJsonField(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeRow(row: Record<string, unknown>): CmsSectionRow {
  return {
    section_key: row.section_key as CmsSectionKey,
    draft_content_en: parseJsonField(row.draft_content_en),
    draft_content_zh: parseJsonField(row.draft_content_zh),
    published_content_en: parseJsonField(row.published_content_en),
    published_content_zh: parseJsonField(row.published_content_zh),
    status: (row.status as 'draft' | 'published') || 'draft',
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
    published_at: row.published_at ? String(row.published_at) : null,
  };
}

export async function ensureCmsDefaults(): Promise<void> {
  await ensureCmsSchema();
  const client = await getDbClient();

  try {
    for (const sectionKey of CMS_SECTION_KEYS) {
      const defaultEn = getDefaultCmsSectionContent(sectionKey, 'en');
      const defaultZh = getDefaultCmsSectionContent(sectionKey, 'zh');

      await client.query(
        `INSERT INTO cms_sections (
          section_key,
          draft_content_en,
          draft_content_zh,
          published_content_en,
          published_content_zh,
          status,
          published_at
        ) VALUES ($1, $2::jsonb, $3::jsonb, $2::jsonb, $3::jsonb, 'published', NOW())
        ON CONFLICT (section_key) DO NOTHING`,
        [sectionKey, JSON.stringify(defaultEn), JSON.stringify(defaultZh)]
      );
    }
  } finally {
    client.release();
  }
}

export async function listCmsSections(): Promise<CmsSectionRow[]> {
  await ensureCmsDefaults();
  const client = await getDbClient();

  try {
    const result = await client.query(
      `SELECT
        section_key,
        draft_content_en,
        draft_content_zh,
        published_content_en,
        published_content_zh,
        status,
        created_at,
        updated_at,
        published_at
      FROM cms_sections
      ORDER BY section_key ASC`
    );

    return result.rows.map((row: Record<string, unknown>) =>
      normalizeRow(row)
    );
  } finally {
    client.release();
  }
}

export async function updateCmsSectionDraft(
  sectionKey: CmsSectionKey,
  locale: CmsLocale,
  content: Record<string, unknown>
): Promise<CmsSectionRow> {
  await ensureCmsDefaults();
  const client = await getDbClient();

  try {
    const column = locale === 'zh' ? 'draft_content_zh' : 'draft_content_en';
    const result = await client.query(
      `UPDATE cms_sections
       SET ${column} = $2::jsonb,
           status = 'draft',
           updated_at = NOW()
       WHERE section_key = $1
       RETURNING
         section_key,
         draft_content_en,
         draft_content_zh,
         published_content_en,
         published_content_zh,
         status,
         created_at,
         updated_at,
         published_at`,
      [sectionKey, JSON.stringify(content)]
    );

    if (!result.rows[0]) {
      throw new Error('CMS section not found');
    }

    return normalizeRow(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function publishCmsSection(
  sectionKey: CmsSectionKey
): Promise<CmsSectionRow> {
  await ensureCmsDefaults();
  const client = await getDbClient();

  try {
    const result = await client.query(
      `UPDATE cms_sections
       SET published_content_en = draft_content_en,
           published_content_zh = draft_content_zh,
           status = 'published',
           published_at = NOW(),
           updated_at = NOW()
       WHERE section_key = $1
       RETURNING
         section_key,
         draft_content_en,
         draft_content_zh,
         published_content_en,
         published_content_zh,
         status,
         created_at,
         updated_at,
         published_at`,
      [sectionKey]
    );

    if (!result.rows[0]) {
      throw new Error('CMS section not found');
    }

    return normalizeRow(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function getPublishedCmsSection(
  sectionKey: CmsSectionKey,
  locale: CmsLocale
): Promise<Record<string, unknown>> {
  await ensureCmsDefaults();
  const client = await getDbClient();

  try {
    const column = locale === 'zh' ? 'published_content_zh' : 'published_content_en';
    const result = await client.query(
      `SELECT ${column} AS section_content
       FROM cms_sections
       WHERE section_key = $1
       LIMIT 1`,
      [sectionKey]
    );

    if (!result.rows[0]) {
      return getDefaultCmsSectionContent(sectionKey, locale);
    }

    return parseJsonField(result.rows[0].section_content);
  } finally {
    client.release();
  }
}
