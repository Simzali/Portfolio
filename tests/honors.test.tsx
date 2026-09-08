import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Honors } from '../src/components/Honors';
import { honorSchema, profileSchema, type Honor } from '../src/content/schema';
import { profile } from '../src/content/profile';

/**
 * Honors are the awards with no timeline entry to sit on - dated by year at
 * best, and often not at all. See docs/adr/ADR-011-honors-section.md.
 */

const honor = (over: Partial<Honor> = {}): Honor => ({
  id: 'an-award',
  title: 'An Award',
  ...over,
});

/** The rendered honor titles, in the order they appear in the document. */
function titles(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('#honors li h3')).map((node) =>
    node.textContent!.trim(),
  );
}

describe('honors ordering', () => {
  it('puts the most recent year first', () => {
    const { container } = render(
      <Honors
        honors={[
          honor({ id: 'old', title: 'Old', year: '2019' }),
          honor({ id: 'new', title: 'New', year: '2026' }),
          honor({ id: 'middle', title: 'Middle', year: '2022' }),
        ]}
      />,
    );

    expect(titles(container)).toEqual(['New', 'Middle', 'Old']);
  });

  it('ranks a span by its latest year, not its first', () => {
    // "2024-2026" was still true in 2026, so it outranks a 2025 award.
    const { container } = render(
      <Honors
        honors={[
          honor({ id: 'single', title: 'Single', year: '2025' }),
          honor({ id: 'span', title: 'Span', year: '2024-2026' }),
        ]}
      />,
    );

    expect(titles(container)).toEqual(['Span', 'Single']);
  });

  it('puts undated honors last, in the order they were written', () => {
    const { container } = render(
      <Honors
        honors={[
          honor({ id: 'first-undated', title: 'First undated' }),
          honor({ id: 'dated', title: 'Dated', year: '2020' }),
          honor({ id: 'second-undated', title: 'Second undated' }),
        ]}
      />,
    );

    expect(titles(container)).toEqual(['Dated', 'First undated', 'Second undated']);
  });
});

describe('honors rendering', () => {
  it('renders nothing at all when there are no honors', () => {
    const { container } = render(<Honors honors={[]} />);
    expect(container.querySelector('#honors')).toBeNull();
  });

  it('shows the organization and year together when both are there', () => {
    const { getByText } = render(
      <Honors honors={[honor({ organization: 'FIRST', year: '2026' })]} />,
    );

    expect(getByText('FIRST · 2026')).toBeTruthy();
  });

  it('omits the meta line entirely when an honor has neither', () => {
    const { container } = render(<Honors honors={[honor()]} />);
    expect(container.querySelectorAll('#honors li p')).toHaveLength(0);
  });
});

describe('the honor contract', () => {
  it('rejects a year with a month in it, because honors do not have months', () => {
    expect(honorSchema.safeParse(honor({ year: '2026-04' })).success).toBe(false);
    expect(honorSchema.safeParse(honor({ year: 'Spring 2026' })).success).toBe(false);
  });

  it.each(['2026', '2024-2026'])('accepts %s as a year', (year) => {
    expect(honorSchema.safeParse(honor({ year })).success).toBe(true);
  });

  it('defaults to an empty list, so a profile without honors is still valid', () => {
    const withoutHonors = { ...profile };
    delete (withoutHonors as Partial<typeof profile>).honors;
    const result = profileSchema.safeParse(withoutHonors);

    expect(result.success).toBe(true);
    expect(result.success && result.data.honors).toEqual([]);
  });

  it('gives every honor a unique id, because ids are React keys', () => {
    const ids = profile.honors.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
