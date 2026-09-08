import { ArrowUpRight } from 'lucide-react';
import type { Highlight } from '../content/schema';

type HighlightsProps = {
  items: Highlight[];
};

/**
 * The four facts a visitor gets if they read nothing else.
 *
 * Lives in the hero rather than in `SECTION_IDS` because it is not a section:
 * no heading, no anchor, and meaningless anywhere except directly under the
 * name. A summary that appears after the evidence is not a summary.
 *
 * Mobile first: one column on a phone, two from `sm:`, four from `md:`. It is
 * never a four-across row at 320px - that is 70px per cell, which is not a
 * number anyone can read. See docs/adr/ADR-013-hero-highlights.md.
 */
export function Highlights({ items }: HighlightsProps) {
  return (
    <ul className="mt-7 grid gap-px sm:grid-cols-2 md:grid-cols-4">
      {items.map((item) => {
        const body = (
          <>
            <span className="text-brand-700 block text-base leading-tight font-bold text-balance sm:text-lg">
              {item.value}
            </span>
            <span className="text-ink-400 mt-1 flex items-start gap-1 text-xs leading-snug text-pretty">
              {item.label}
              {item.href ? (
                <ArrowUpRight aria-hidden="true" className="mt-px h-3 w-3 shrink-0" />
              ) : null}
            </span>
          </>
        );

        return (
          <li key={item.value} className="border-ink-200 bg-surface rounded-lg border p-3.5">
            {item.href ? (
              // The label carries the "source:" prefix rather than the visible
              // text, so a screen reader announces what the link is for instead
              // of reading out a bare statistic as if it were a destination.
              <a
                href={item.href}
                aria-label={`${item.value} - ${item.label}. Source.`}
                className="hover:decoration-brand-300 block decoration-transparent underline-offset-4 transition-colors hover:underline"
              >
                {body}
              </a>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
