import { createElement, useRef } from 'react';
import { Briefcase, FolderGit2 } from 'lucide-react';
import type { TimelineEntry } from '../content/schema';
import { hueFor, iconForEntry } from './icon-map';
import { ImageDialog, type ImageDialogHandle } from './ImageDialog';

type EntryCoverProps = {
  entry: TimelineEntry;
};

/**
 * The visual for an entry.
 *
 * The first image wins - a photo of the thing you built beats anything
 * generated. Any further images sit behind a dialog opened from the cover, so
 * a project can show both the built object and its CAD without either being
 * shrunk to a thumbnail. See docs/adr/ADR-015-entry-images.md.
 *
 * With no images we draw a cover from the entry itself: a stable hue from its
 * id, and an icon picked from its tags, so a project about maps gets a map.
 * Nobody has to choose a colour, and no two entries look the same.
 */
export function EntryCover({ entry }: EntryCoverProps) {
  const dialog = useRef<ImageDialogHandle>(null);

  const [cover, ...rest] = entry.images;

  if (cover) {
    const picture = (
      <img
        src={cover.src}
        alt={cover.alt}
        width={960}
        height={640}
        loading="lazy"
        decoding="async"
        className="border-ink-200 aspect-[3/2] w-full rounded-xl border object-cover"
      />
    );

    return (
      <figure className="sm:order-last sm:w-56 sm:shrink-0">
        {rest.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => dialog.current?.open(0)}
              aria-label={`${entry.title}: view ${entry.images.length} images`}
              className="group relative block w-full cursor-pointer"
            >
              {picture}
              <span className="bg-ink-50/90 border-ink-200 text-ink-800 group-hover:border-brand-500 group-hover:text-brand-700 absolute right-1.5 bottom-1.5 rounded-md border px-1.5 py-0.5 text-[0.6875rem] font-semibold transition-colors">
                +{rest.length}
              </span>
            </button>

            <ImageDialog
              ref={dialog}
              images={entry.images}
              label={`${entry.title} images`}
            />
          </>
        ) : (
          picture
        )}

        {cover.credit ? (
          <figcaption className="text-ink-400 mt-1.5 text-[0.6875rem] leading-snug">
            {cover.credit}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const hue = hueFor(entry.id);
  const glyph = createElement(iconForEntry(entry.tags, entry.kind === 'work' ? Briefcase : FolderGit2), {
    className: 'absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-white/85',
    strokeWidth: 1.5,
  });

  return (
    <div
      aria-hidden="true"
      className="border-ink-200 relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl border sm:order-last sm:w-56"
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(0.72 0.16 ${hue}), oklch(0.44 0.19 ${hue + 26}))`,
      }}
    >
      {/* Dot lattice, for texture that does not compete with the icon. */}
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '11px 11px',
          color: 'oklch(1 0 0 / 0.5)',
        }}
      />
      {/* Light falling from the top left, so the panel has a direction. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(120% 90% at 18% 8%, oklch(1 0 0 / 0.42), transparent 62%)',
        }}
      />
      {glyph}
    </div>
  );
}
