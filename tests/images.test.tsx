import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../src/components/Timeline';
import { timelineEntrySchema, type TimelineEntry } from '../src/content/schema';

/**
 * Entry images, and the dialog the extras open in.
 * See docs/adr/ADR-015-entry-images.md.
 */

const entry = (images: TimelineEntry['images']): TimelineEntry => ({
  id: 'a-project',
  kind: 'project',
  title: 'The Bat',
  startDate: '2025-06',
  endDate: '2025-06',
  summary: 'An assistive navigation device.',
  images,
  highlights: [],
  tags: [],
  links: [],
});

const img = (n: number) => ({ src: `/photo-${n}.jpg`, alt: `Photo ${n}` });

describe('entry images', () => {
  it('shows a single image with no button and no badge', () => {
    render(<Timeline entries={[entry([img(1)])]} />);

    expect(screen.getByAltText('Photo 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /view .* images/ })).not.toBeInTheDocument();
  });

  it('draws the generated cover when there are no images', () => {
    const { container } = render(<Timeline entries={[entry([])]} />);

    expect(container.querySelector('#a-project img')).toBeNull();
  });

  it('turns the cover into a button and counts the extras', () => {
    render(<Timeline entries={[entry([img(1), img(2), img(3)])]} />);

    const opener = screen.getByRole('button', { name: 'The Bat: view 3 images' });
    expect(within(opener).getByText('+2')).toBeInTheDocument();
  });
});

describe('the image dialog', () => {
  const threeImages = () => entry([img(1), img(2), img(3)]);

  it('opens from the cover, and opens again after being closed', async () => {
    const user = userEvent.setup();
    const { container } = render(<Timeline entries={[threeImages()]} />);
    const dialog = container.querySelector('dialog')!;
    const opener = screen.getByRole('button', { name: /view 3 images/ });

    await user.click(opener);
    expect(dialog.open).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog.open).toBe(false);

    // The bug this pins: openness used to be mirrored in React state, so
    // reopening at the same index was an identical state value, no render
    // happened, and the dialog could only ever be opened once. See ADR-015.
    await user.click(opener);
    expect(dialog.open).toBe(true);
  });

  it('steps forward and wraps around', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={[threeImages()]} />);

    await user.click(screen.getByRole('button', { name: /view 3 images/ }));
    expect(screen.getByText('1 of 3')).toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Next image' });
    await user.click(next);
    expect(screen.getByText('2 of 3')).toBeInTheDocument();

    await user.click(next);
    await user.click(next);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('steps backwards from the first image to the last', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={[threeImages()]} />);

    await user.click(screen.getByRole('button', { name: /view 3 images/ }));
    await user.click(screen.getByRole('button', { name: 'Previous image' }));

    expect(screen.getByText('3 of 3')).toBeInTheDocument();
  });

  it('names the dialog after the entry, so it is not just "dialog"', () => {
    const { container } = render(<Timeline entries={[threeImages()]} />);

    expect(container.querySelector('dialog')!.getAttribute('aria-label')).toBe('The Bat images');
  });
});

describe('the image contract', () => {
  it('requires alt text on every image', () => {
    const result = timelineEntrySchema.safeParse({
      ...entry([]),
      images: [{ src: '/photo.jpg', alt: '' }],
    });
    expect(result.success).toBe(false);
  });

  it.each(['javascript:alert(1)', '//evil.example/x.jpg'])('rejects %s as an image src', (src) => {
    const result = timelineEntrySchema.safeParse({ ...entry([]), images: [{ src, alt: 'x' }] });
    expect(result.success).toBe(false);
  });

  it('caps the gallery at six', () => {
    const many = Array.from({ length: 7 }, (_, i) => img(i));
    expect(timelineEntrySchema.safeParse({ ...entry([]), images: many }).success).toBe(false);
    expect(
      timelineEntrySchema.safeParse({ ...entry([]), images: many.slice(0, 6) }).success,
    ).toBe(true);
  });
});
