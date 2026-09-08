import { useMemo, useState } from 'react';
import { History } from 'lucide-react';
import type { TimelineEntry as Entry, TimelineFilterValue } from '../content/schema';
import { TimelineEntry } from './TimelineEntry';
import { TimelineFilter } from './TimelineFilter';

/**
 * Still going first, then most recently finished - and within either group,
 * whatever has been running longest.
 *
 * The "longest running" half is the part worth explaining. Among things that
 * are all still true, the interesting one is the commitment somebody has held
 * for three years, not the one they picked up last term, so ongoing entries
 * sort by *earliest* start. Finished entries still lead with recency, because
 * a thing that ended four years ago is not more interesting for having lasted a
 * while; duration only breaks ties between two that ended together.
 *
 * This exists because array order in `profile.ts` is not a source of truth -
 * that file gets rewritten wholesale when you import a resume, and nothing
 * guarantees the order survives. A genuine tie is the one exception: the sort
 * is stable, so entries that start and end together stay in the order they were
 * written, which is the only place the author gets to express a preference.
 *
 * See docs/adr/ADR-012-timeline-order.md.
 */
function sortTimeline(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    // Still going beats finished, whatever the dates say.
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;

    // Both finished: the one that ended most recently comes first.
    if (a.endDate !== null && b.endDate !== null && a.endDate !== b.endDate) {
      return a.endDate < b.endDate ? 1 : -1;
    }

    // Same standing: the one that has been running longer comes first.
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;

    return 0;
  });
}

type TimelineProps = {
  entries: Entry[];
};

export function Timeline({ entries }: TimelineProps) {
  const [filter, setFilter] = useState<TimelineFilterValue>('all');

  const sorted = useMemo(() => sortTimeline(entries), [entries]);
  const visible = useMemo(
    () => (filter === 'all' ? sorted : sorted.filter((entry) => entry.kind === filter)),
    [sorted, filter],
  );

  return (
    <section id="timeline" className="scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="border-ink-200 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b pb-4">
          <div>
            <h2 className="text-ink-950 flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="bg-brand-100 text-brand-700 grid h-9 w-9 shrink-0 place-items-center rounded-lg">
                <History aria-hidden="true" className="h-5 w-5" />
              </span>
              Work and projects
            </h2>
            <p aria-live="polite" className="text-ink-400 mt-1 text-sm">
              Showing {visible.length} of {sorted.length}
            </p>
          </div>
          <TimelineFilter value={filter} onChange={setFilter} />
        </div>

        {visible.length > 0 ? (
          <ul className="mt-8 pl-1">
            {visible.map((entry) => (
              <TimelineEntry key={entry.id} entry={entry} />
            ))}
          </ul>
        ) : (
          <p className="text-ink-600 mt-8">Nothing here yet.</p>
        )}
      </div>
    </section>
  );
}
