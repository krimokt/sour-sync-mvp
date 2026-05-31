import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_LOCALE, type StorefrontLocale } from './storefront-dict';
import type { CaseStudySeo, TestimonialSeo } from '@/lib/seo-data';

/**
 * Server-side machine translation of tenant content with a DB cache.
 *
 * Tenant copy is written once (in any language). When a visitor requests a
 * non-default locale we translate the relevant strings via Gemini and cache
 * the result in `tenant_content_i18n`, keyed by a hash of the source so we
 * only re-translate when the tenant edits. English is passed through.
 *
 * Names of people, companies, URLs, icons, colors and the like are never
 * translated (see the key denylist + value guards below).
 */

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';

const LOCALE_NAME: Record<StorefrontLocale, string> = {
  en: 'English',
  zh: 'Simplified Chinese',
  ar: 'Arabic',
  ru: 'Russian',
};

// Server-side Supabase client (service role) for writing the cache.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

// Keys whose string values must never be translated (urls, icons, handles…).
const SKIP_KEYS = new Set([
  'icon', 'href', 'url', 'image', 'backgroundImage', 'cover_image', 'og_image',
  'avatar_image', 'logo', 'logoUrl', 'platform', 'slug', 'id', 'email', 'phone',
  'whatsapp', 'wechat', 'facebook', 'instagram', 'linkedin', 'twitter',
  'value', 'suffix', 'metric_value', 'year', 'rating', 'sort_order',
  'author_name', 'client_name', 'author_company',
]);

const URL_OR_CODE = /^(https?:\/\/|\/|#|mailto:|tel:|data:)/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX = /^#?[0-9a-fA-F]{3,8}$/;

function isTranslatableValue(s: string): boolean {
  const v = s.trim();
  if (v.length < 2) return false;
  if (URL_OR_CODE.test(v) || EMAIL.test(v) || HEX.test(v)) return false;
  if (!/[\p{L}]/u.test(v)) return false; // must contain a letter
  if (/^\d[\d.,%+\s-]*$/.test(v)) return false; // pure number/metric
  return true;
}

/** Call Gemini once to translate a batch of unique strings. */
async function geminiBatch(strings: string[], locale: StorefrontLocale): Promise<string[]> {
  if (!GEMINI_KEY || strings.length === 0) return strings;
  const prompt =
    `Translate each item in the following JSON array into ${LOCALE_NAME[locale]}.\n` +
    `Return ONLY a JSON array of strings, same length and order. Translate marketing/UI copy ` +
    `naturally for a B2B sourcing company. Keep brand names, product model numbers, numbers, ` +
    `emails and URLs unchanged. Do not add, drop, merge or reorder items.\n\n` +
    JSON.stringify(strings);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length !== strings.length) {
    throw new Error('gemini shape mismatch');
  }
  return parsed.map((x, i) => (typeof x === 'string' && x.trim() ? x : strings[i]));
}

/** Translate a flat list of unique strings → Map(original → translated). */
async function translateUnique(values: string[], locale: StorefrontLocale): Promise<Map<string, string>> {
  const unique = [...new Set(values.filter(isTranslatableValue))];
  const map = new Map<string, string>();
  if (unique.length === 0) return map;
  // Chunk to keep each request small and resilient.
  const CHUNK = 80;
  for (let i = 0; i < unique.length; i += CHUNK) {
    const slice = unique.slice(i, i + CHUNK);
    const out = await geminiBatch(slice, locale);
    slice.forEach((s, j) => map.set(s, out[j] ?? s));
  }
  return map;
}

// ---- Deep walk (for the nested builder content) ----

function collectDeep(node: unknown, acc: string[], key?: string): void {
  if (typeof node === 'string') {
    if (!(key && SKIP_KEYS.has(key)) && isTranslatableValue(node)) acc.push(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v) => collectDeep(v, acc, key));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) collectDeep(v, acc, k);
  }
}

function injectDeep(node: unknown, map: Map<string, string>, key?: string): unknown {
  if (typeof node === 'string') {
    if (key && SKIP_KEYS.has(key)) return node;
    return map.get(node) ?? node;
  }
  if (Array.isArray(node)) return node.map((v) => injectDeep(v, map, key));
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = injectDeep(v, map, k);
    return out;
  }
  return node;
}

async function getCachedOrTranslate<T>(
  companyId: string,
  kind: string,
  source: T,
  locale: StorefrontLocale,
  translateFn: (src: T, map: Map<string, string>) => T,
  collectFn: (src: T) => string[],
): Promise<T> {
  if (locale === DEFAULT_LOCALE) return source;
  const hash = sha1(stableStringify(source));

  try {
    const { data } = await admin
      .from('tenant_content_i18n')
      .select('source_hash, content')
      .eq('company_id', companyId)
      .eq('locale', locale)
      .eq('kind', kind)
      .maybeSingle();
    if (data && (data as { source_hash: string }).source_hash === hash) {
      return (data as { content: T }).content;
    }

    const map = await translateUnique(collectFn(source), locale);
    if (map.size === 0) return source;
    const translated = translateFn(source, map);

    await admin
      .from('tenant_content_i18n')
      .upsert(
        { company_id: companyId, locale, kind, source_hash: hash, content: translated, updated_at: new Date().toISOString() },
        { onConflict: 'company_id,locale,kind' },
      );
    return translated;
  } catch {
    // Never break the page on a translation failure — fall back to source.
    return source;
  }
}

/** Translate the nested builder generatedContent for a locale (cached). */
export async function translateBuilderContent<T>(companyId: string, content: T, locale: StorefrontLocale): Promise<T> {
  return getCachedOrTranslate(
    companyId,
    'builder',
    content,
    locale,
    (src, map) => injectDeep(src, map) as T,
    (src) => {
      const acc: string[] = [];
      collectDeep(src, acc);
      return acc;
    },
  );
}

/** Translate explicit fields across an array of records (cached). */
async function translateRecords<T extends Record<string, unknown>>(
  companyId: string,
  kind: string,
  rows: T[],
  fields: (keyof T)[],
  locale: StorefrontLocale,
): Promise<T[]> {
  if (rows.length === 0) return rows;
  return getCachedOrTranslate(
    companyId,
    kind,
    rows,
    locale,
    (src, map) =>
      src.map((row) => {
        const next: Record<string, unknown> = { ...row };
        for (const f of fields) {
          const val = row[f];
          if (typeof val === 'string') next[f as string] = map.get(val) ?? val;
        }
        return next as T;
      }),
    (src) => {
      const acc: string[] = [];
      for (const row of src) for (const f of fields) {
        const val = row[f];
        if (typeof val === 'string') acc.push(val);
      }
      return acc;
    },
  );
}

export async function translateCaseStudies(
  companyId: string,
  rows: CaseStudySeo[],
  locale: StorefrontLocale,
): Promise<CaseStudySeo[]> {
  const out = await translateRecords(
    companyId,
    'casestudies',
    rows as unknown as Record<string, unknown>[],
    ['title', 'summary', 'scope', 'metric_label'],
    locale,
  );
  return out as unknown as CaseStudySeo[];
}

export async function translateTestimonials(
  companyId: string,
  rows: TestimonialSeo[],
  locale: StorefrontLocale,
): Promise<TestimonialSeo[]> {
  const out = await translateRecords(
    companyId,
    'testimonials',
    rows as unknown as Record<string, unknown>[],
    ['quote', 'author_title'],
    locale,
  );
  return out as unknown as TestimonialSeo[];
}
