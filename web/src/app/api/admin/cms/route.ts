import { NextRequest, NextResponse } from 'next/server';
import {
  listCmsSections,
  publishCmsSection,
  updateCmsSectionDraft,
} from '@/lib/cms';
import { CMS_SECTION_KEYS, CmsLocale, CmsSectionKey } from '@/types/cms';

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || 'admin_session';
const ADMIN_SESSION_TOKEN =
  process.env.ADMIN_SESSION_TOKEN || 'admin_session_token';

function hasAdminSession(request: NextRequest): boolean {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return session === ADMIN_SESSION_TOKEN;
}

function isValidSectionKey(value: string): value is CmsSectionKey {
  return CMS_SECTION_KEYS.includes(value as CmsSectionKey);
}

export async function GET(request: NextRequest) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sections = await listCmsSections();
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Failed to list cms sections:', error);
    return NextResponse.json({ error: 'Failed to list cms sections' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      section_key?: string;
      locale?: CmsLocale;
      content?: Record<string, unknown>;
    };

    const sectionKey = body.section_key || '';
    const locale = body.locale === 'zh' ? 'zh' : 'en';

    if (!isValidSectionKey(sectionKey)) {
      return NextResponse.json({ error: 'Invalid section_key' }, { status: 400 });
    }

    if (!body.content || typeof body.content !== 'object') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    const row = await updateCmsSectionDraft(sectionKey, locale, body.content);
    return NextResponse.json({ section: row });
  } catch (error) {
    console.error('Failed to update cms draft:', error);
    return NextResponse.json({ error: 'Failed to update cms draft' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { section_key?: string };
    const sectionKey = body.section_key || '';

    if (!isValidSectionKey(sectionKey)) {
      return NextResponse.json({ error: 'Invalid section_key' }, { status: 400 });
    }

    const row = await publishCmsSection(sectionKey);
    return NextResponse.json({ section: row });
  } catch (error) {
    console.error('Failed to publish cms section:', error);
    return NextResponse.json({ error: 'Failed to publish cms section' }, { status: 500 });
  }
}
