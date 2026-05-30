import { Fragment } from 'react';

/**
 * Renders one or more schema.org JSON-LD blocks as <script type="application/ld+json">.
 * Server component — safe to drop anywhere in a server-rendered page.
 * Pass a single object or an array; falsy entries are skipped.
 */
export default function JsonLd({
  data,
}: {
  data:
    | Record<string, unknown>
    | null
    | undefined
    | (Record<string, unknown> | null | undefined)[];
}) {
  const blocks = (Array.isArray(data) ? data : [data]).filter(Boolean) as Record<string, unknown>[];
  if (blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <script
            type="application/ld+json"
            // JSON.stringify output is safe here; data originates from our own builders.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        </Fragment>
      ))}
    </>
  );
}
