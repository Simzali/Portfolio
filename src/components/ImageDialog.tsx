import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Image } from '../content/schema';

export type ImageDialogHandle = {
  /** Show the dialog, starting at this image. */
  open: (index: number) => void;
};

type ImageDialogProps = {
  images: Image[];
  /** Names the dialog, so a screen reader says which entry it belongs to. */
  label: string;
  ref?: Ref<ImageDialogHandle>;
};

/**
 * A native `<dialog>` showing one image at a time.
 *
 * `showModal()` does the work a lightbox library would: focus moves into the
 * dialog and is trapped, Escape closes it, the rest of the page goes inert,
 * and focus returns to whatever opened it. See ADR-015.
 *
 * Openness lives in the DOM, not in React state, and that is deliberate. The
 * first version mirrored it into state and synced with an effect, which broke
 * twice over: `dialog.close()` fires no `close` event in every engine, so the
 * mirrored state never reset; and once it was stuck, reopening at the same
 * index was a no-op update, so the effect never re-ran and the dialog never
 * reopened. Calling `showModal()` directly has neither failure mode - there is
 * only one source of truth, and it is the element.
 *
 * React state here tracks only which image is showing.
 */
export function ImageDialog({ images, label, ref }: ImageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    open(at: number) {
      setIndex(at);
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    },
  }));

  const count = images.length;
  const current = images[index];
  const step = (by: number) => setIndex((i) => (i + by + count) % count);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
      }}
      // A click landing on the dialog element itself, rather than on its
      // contents, is a click on the backdrop.
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="bg-ink-50 text-ink-800 border-ink-200 m-auto w-[min(56rem,92vw)] rounded-xl border p-3 backdrop:bg-black/70 sm:p-4"
    >
      {current ? (
        <figure className="m-0">
          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[70vh] w-full rounded-lg object-contain"
          />
          <figcaption className="text-ink-400 mt-2 text-xs leading-snug">
            {current.alt}
            {current.credit ? <span className="text-ink-600"> &middot; {current.credit}</span> : null}
          </figcaption>
        </figure>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        {count > 1 ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="border-ink-200 text-ink-600 hover:border-brand-500 hover:text-brand-700 grid h-8 w-8 place-items-center rounded-lg border transition-colors"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="border-ink-200 text-ink-600 hover:border-brand-500 hover:text-brand-700 grid h-8 w-8 place-items-center rounded-lg border transition-colors"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <p aria-live="polite" className="text-ink-400 ml-1 text-xs">
              {index + 1} of {count}
            </p>
          </div>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="border-ink-200 text-ink-600 hover:border-brand-500 hover:text-brand-700 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          Close
        </button>
      </div>
    </dialog>
  );
}
