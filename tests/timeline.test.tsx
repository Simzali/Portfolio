import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../src/components/Timeline';
import type { TimelineEntry } from '../src/content/schema';

/**
 * Behaviour, not markup.
 *
 * The classic thing people forget to test is that the filter actually filters.
 * It is easy to test that three buttons render. That test passes even when
 * clicking them does nothing.
 */
const entries: TimelineEntry[] = [
  {
    id: 'current-job',
    kind: 'work',
    title: 'Software Engineering Intern',
    organization: 'Northlight Health',
    startDate: '2026-05',
    endDate: null,
    summary: 'A job that is still going.',
    highlights: [],
    tags: [],
    links: [],
  },
  {
    id: 'old-job',
    kind: 'work',
    title: 'Front-End Developer',
    organization: 'Riverside Public Library',
    startDate: '2024-09',
    endDate: '2025-05',
    summary: 'A job that has ended.',
    highlights: [],
    tags: [],
    links: [],
  },
  {
    id: 'side-project',
    kind: 'project',
    title: 'Trailhead',
    startDate: '2025-06',
    endDate: '2025-09',
    summary: 'A project.',
    highlights: [],
    tags: [],
    links: [],
  },
];

/**
 * `queryAllByRole`, not `getAllByRole`: "no entries are visible" is a real state
 * this component has to handle, and the `get*` family throws on zero matches
 * rather than returning the empty array that state should produce.
 */
function visibleEntryIds(): string[] {
  return screen
    .queryAllByRole('listitem')
    .filter((node) => node.dataset.kind !== undefined)
    .map((node) => node.id);
}

describe('Timeline filter', () => {
  it('shows everything by default', () => {
    render(<Timeline entries={entries} />);
    expect(visibleEntryIds()).toHaveLength(3);
  });

  it('hides work entries when Projects is selected', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    await user.click(screen.getByRole('button', { name: 'Projects' }));

    expect(screen.queryByText('Software Engineering Intern')).not.toBeInTheDocument();
    expect(screen.queryByText('Front-End Developer')).not.toBeInTheDocument();
    expect(screen.getByText('Trailhead')).toBeInTheDocument();
    expect(visibleEntryIds()).toEqual(['side-project']);
  });

  it('hides projects when Work is selected, and comes back on All', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    await user.click(screen.getByRole('button', { name: 'Work' }));
    expect(visibleEntryIds()).toEqual(['current-job', 'old-job']);

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(visibleEntryIds()).toHaveLength(3);
  });

  it('is reachable and operable from the keyboard alone', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    const projects = screen.getByRole('button', { name: 'Projects' });
    projects.focus();
    expect(projects).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(visibleEntryIds()).toEqual(['side-project']);
  });

  it('tells assistive tech which filter is active', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    const group = screen.getByRole('group', { name: 'Filter timeline' });
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(within(group).getByRole('button', { name: 'Work' }));
    expect(within(group).getByRole('button', { name: 'Work' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  /*
   * A resume with no side projects on it is a normal resume, and the filter has
   * to stay honest when one of its three buttons can only ever return nothing.
   * See the 2026-08-27 amendment in docs/adr/ADR-003-content-model.md.
   */
  it('shows the empty state when a filter matches nothing, not a blank stretch of page', async () => {
    const user = userEvent.setup();
    const workOnly = entries.filter((entry) => entry.kind === 'work');
    render(<Timeline entries={workOnly} />);

    await user.click(screen.getByRole('button', { name: 'Projects' }));

    expect(visibleEntryIds()).toEqual([]);
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
    expect(screen.getByText('Showing 0 of 2')).toBeInTheDocument();
  });

  it('sorts most recent first, with present-day entries at the top', () => {
    render(<Timeline entries={entries} />);
    // Deliberately passed in a scrambled-ish order above; ordering must come
    // from the dates, not from the array, because profile.ts gets rewritten.
    expect(visibleEntryIds()).toEqual(['current-job', 'side-project', 'old-job']);
  });
});

/**
 * Ordering, on its own. See docs/adr/ADR-012-timeline-order.md.
 *
 * The rule that changed: among entries that are all still going, the one that
 * has been running longest leads, because "when did you start" is not a recency
 * signal when every one of them is equally current.
 */
describe('Timeline order', () => {
  const ongoing = (id: string, startDate: string): TimelineEntry => ({
    id,
    kind: 'work',
    title: id,
    startDate,
    endDate: null,
    summary: 'Still going.',
    highlights: [],
    tags: [],
    links: [],
  });

  const finished = (id: string, startDate: string, endDate: string): TimelineEntry => ({
    ...ongoing(id, startDate),
    endDate,
    summary: 'Over.',
  });

  it('puts the longest-running ongoing entry first', () => {
    render(
      <Timeline
        entries={[ongoing('newest', '2025-09'), ongoing('oldest', '2023-09'), ongoing('middle', '2024-09')]}
      />,
    );

    expect(visibleEntryIds()).toEqual(['oldest', 'middle', 'newest']);
  });

  it('still leads with recency among finished entries, not with duration', () => {
    // `long-and-old` ran for four years; it is still over, and `short-and-recent`
    // ended last month. Duration must not promote a finished entry.
    render(
      <Timeline
        entries={[
          finished('long-and-old', '2015-01', '2019-01'),
          finished('short-and-recent', '2025-08', '2025-09'),
        ]}
      />,
    );

    expect(visibleEntryIds()).toEqual(['short-and-recent', 'long-and-old']);
  });

  it('breaks a same-end-date tie towards the one that ran longer', () => {
    render(
      <Timeline
        entries={[finished('brief', '2025-08', '2025-09'), finished('long', '2023-01', '2025-09')]}
      />,
    );

    expect(visibleEntryIds()).toEqual(['long', 'brief']);
  });

  it('keeps an ongoing entry above a finished one that ended in the future', () => {
    render(<Timeline entries={[finished('ended', '2020-01', '2099-01'), ongoing('going', '2024-01')]} />);

    expect(visibleEntryIds()).toEqual(['going', 'ended']);
  });

  /*
   * Four of Simra's entries start and end on exactly the same dates, so the
   * dates cannot choose between them and something has to. The sort is stable,
   * which makes the order in `profile.ts` the tie-break - the one place the
   * author gets a say. This is documented behaviour, not an accident.
   */
  it('leaves entries that tie exactly in the order they were written', () => {
    render(
      <Timeline
        entries={[ongoing('written-first', '2023-09'), ongoing('written-second', '2023-09')]}
      />,
    );

    expect(visibleEntryIds()).toEqual(['written-first', 'written-second']);
  });
});
