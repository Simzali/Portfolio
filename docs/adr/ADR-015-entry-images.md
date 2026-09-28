# ADR-015: An entry has a list of images, and the extras open in a dialog

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Simra Ali

## Context

An entry could carry one image. For most of the timeline that is right - a
programme or a club needs no picture, and the generated cover (a hue from the
entry id, an icon from its tags) fills the slot without anyone choosing
anything.

It is wrong for the projects. "The Bat" is a physical device: there is a photo
of the built thing, and there is the CAD of it, and they show different
claims. A robot has a render and a photograph. One image per entry forces a
choice between showing what something looked like and showing how it was
designed, and the second is the part that is actually hers.

The constraint is the slot. The cover sits beside the prose at 224px wide from
`sm:` up. Three images in that space are 70px each - visible as texture,
useless as evidence. Whatever carries several images cannot lay them out
inline.

## Decision

`timelineEntrySchema.image` becomes **`images`**, an array, capped at six.
`images[0]` is the cover and renders exactly where the single image used to.
When there is more than one, the cover becomes a button, a `+N` badge says how
many more there are, and clicking opens a **native `<dialog>`** showing one
image at a time with previous/next controls.

`<dialog>` with `showModal()` is the whole reason this is affordable. The
browser gives us the modal behaviour that is otherwise a library: focus moves
into the dialog and is trapped there, `Esc` closes it, the rest of the page is
inert, and focus returns to the button that opened it. No dependency, and
[CLAUDE.md](../../CLAUDE.md) is explicit that a dependency has to justify its
cost.

Zero, one, or many is now one field instead of a special case. An entry with no
images still gets the generated cover; an entry with one behaves exactly as
before, with no button and no badge.

## Openness lives in the DOM, not in React state

The first implementation mirrored open/closed into React state and reconciled
it with an effect. It failed twice, and both failures are worth recording
because the design that avoids them looks less idiomatic at first glance.

**`dialog.close()` fired no `close` event.** The code reset its state from that
event, so after the first close the state still said "open at image 0".
Measured directly: a listener on the element counted zero `close` events across
an open/close cycle that demonstrably closed the dialog.

**Reopening at the same index was a no-op.** Once the state was stuck at `0`,
clicking the cover set it to `0` again. React bails out of an identical state
value, so no render happened, so the effect never re-ran, so `showModal()` was
never called. The dialog could be opened exactly once per page load.

So the element owns whether it is open, and `showModal()` is called directly
from the click handler. React state tracks only which image is showing. There
is one source of truth, no synchronisation, and no way for the two to drift.

## Options we rejected

### Option: a thumbnail strip in the cover slot

Two or three images side by side where the cover is. No new interaction, and
at 224px wide each thumbnail is about 70px - too small to read a CAD screenshot
or a circuit. It would signal "there are images here" while showing none of
them, which is the worst of both.

### Option: a full-width gallery row under the entry

Room for real detail, and it spends vertical space on a timeline that is
already fifteen entries long. The page's job is to let someone scan a career
quickly; a strip of images under every project fights that directly.

### Option: a lightbox library

`photoswipe`, `yet-another-react-lightbox` and friends solve this well and cost
40-80kB plus a dependency to keep current on a site whose entire JS bundle is
currently 228kB. `<dialog>` does the hard parts natively. If the gallery ever
needs pinch-zoom or swipe gestures, revisit - that is where hand-rolling stops
being cheap.

### Option: keep `image` and add `gallery`

Less churn: the cover stays where it is and extra images go in a second field.
It also means two fields describing one thing, an implicit rule that `gallery`
is meaningless without `image`, and a schema that cannot express "two images"
without deciding which one is special twice. One ordered list says it once.

### Option: link out to an album

Cheapest of all, and it sends a reader off the page - to a service that needs
its own login, that can change its URL scheme, and that we do not control. The
existing rule that every linked URL is checked before it ships exists because
dead links read as claims that were never true; an album is that risk on every
image at once.

## Consequences

- **Good:** A project can show the built thing *and* its design, which is the
  pairing that makes engineering work legible to someone who was not there.
- **Good:** Modal behaviour, keyboard handling and focus return come from the
  browser rather than from code we maintain.
- **Bad:** The timeline now contains an interactive control. The page was
  static markup apart from the filter; this is a second thing that can break,
  and it has to keep working at 320px where the dialog is nearly the viewport.
- **Bad:** `alt` is required per image, so adding six images means writing six
  descriptions. That is the correct cost and it is still a cost.
- **Bad:** Nothing lazy-loads the images behind the dialog beyond the browser's
  own `loading="lazy"`, so an entry with six large photos downloads them when
  the dialog opens rather than on page load - acceptable, but it means image
  weight is now something to watch when adding them.
- **We will need to revisit this when:** an entry wants video, or when a reader
  on a phone wants to swipe rather than tap arrows.
