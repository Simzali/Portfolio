import { Award, Medal } from 'lucide-react';
import type { Honor } from '../content/schema';

/**
 * The most recent year an honor names. "2024-2026" is as recent as "2026",
 * because it was still true in 2026. Undated honors sort last.
 */
function latestYear(honor: Honor): number {
  const years = honor.year?.match(/\d{4}/g);
  if (!years) return -1;
  return Math.max(...years.map(Number));
}

/**
 * Most recent first, undated last, stable within a year.
 *
 * Array order in `profile.ts` is not a source of truth - that file gets
 * rewritten wholesale when a resume is re-imported - which is the same reason
 * `Timeline` sorts rather than trusting its input. See ADR-011.
 */
function sortHonors(honors: Honor[]): Honor[] {
  return honors
    .map((honor, index) => ({ honor, index }))
    .sort((a, b) => latestYear(b.honor) - latestYear(a.honor) || a.index - b.index)
    .map(({ honor }) => honor);
}

type HonorsProps = {
  honors: Honor[];
};

export function Honors({ honors }: HonorsProps) {
  if (honors.length === 0) return null;

  return (
    // Same vertical rhythm as every other orderable section, so moving it in
    // `profile.sections` cannot change the page's spacing. See ADR-006.
    <section id="honors" className="scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-ink-950 flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="bg-brand-100 text-brand-700 grid h-9 w-9 shrink-0 place-items-center rounded-lg">
            <Award aria-hidden="true" className="h-5 w-5" />
          </span>
          Honors
        </h2>

        {/* One column on a phone, two from `sm:` up. No fixed widths. */}
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {sortHonors(honors).map((honor) => (
            <li
              key={honor.id}
              className="border-ink-200 bg-surface flex gap-3 rounded-xl border p-4"
            >
              <Medal aria-hidden="true" className="text-brand-500 mt-0.5 h-4 w-4 shrink-0" />

              <div className="min-w-0">
                <h3 className="text-ink-950 leading-snug font-semibold text-pretty">
                  {honor.title}
                </h3>

                {honor.organization || honor.year ? (
                  <p className="text-ink-400 mt-1 text-sm">
                    {honor.organization}
                    {honor.organization && honor.year ? ' · ' : null}
                    {honor.year}
                  </p>
                ) : null}

                {honor.note ? (
                  <p className="text-ink-600 mt-1.5 text-sm leading-relaxed text-pretty">
                    {honor.note}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
