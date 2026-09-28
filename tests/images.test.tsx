import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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
  /*
   * A single image opens too. The first version reserved the dialog for
   * galleries, which left a project poster - unreadable at 224px and the thing
   * most worth enlarging - as the one image with nothing to click. The badge
   * is what depends on the count, not the dialog. See ADR-015.
   */
  it('opens a single image, and shows no badge for it', async () => {
    const user = userEvent.setup();
    const { container } = render(<Timeline entries={[entry([img(1)])]} />);

    // Scoped to the cover: the dialog now mounts alongside it and holds the
    // same image, so an unscoped alt-text query matches twice.
    const opener = screen.getByRole('button', { name: 'The Bat: open the image' });
    expect(within(opener).getByAltText('Photo 1')).toBeInTheDocument();
    expect(within(opener).queryByText((text) => text.startsWith('+'))).not.toBeInTheDocument();

    await user.click(opener);
    expect(container.querySelector('dialog')!.open).toBe(true);
  });

  it('gives a lone image no previous or next control', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={[entry([img(1)])]} />);

    await user.click(screen.getByRole('button', { name: /open the image/ }));

    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous image' })).not.toBeInTheDocument();
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

  it('fetches the whole gallery on open, so no image is still loading when stepped to', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={[threeImages()]} />);

    // A browser keeps painting the image it already has until the next one
    // decodes, while the caption - React state - changes at once. Fetching
    // on open is what stops a reader seeing one photo under another's
    // description. See docs/adr/ADR-015-entry-images.md.
    const created: HTMLImageElement[] = [];
    const real = document.createElement.bind(document);
    const spy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string, options?: ElementCreationOptions) => {
        const element = real(tag, options);
        if (element instanceof HTMLImageElement) created.push(element);
        return element;
      }) as typeof document.createElement);

    await user.click(screen.getByRole('button', { name: /view 3 images/ }));
    spy.mockRestore();

    const requested = new Set(created.map((el) => el.getAttribute('src')).filter(Boolean));
    expect(requested).toEqual(new Set(['/photo-1.jpg', '/photo-2.jpg', '/photo-3.jpg']));
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
