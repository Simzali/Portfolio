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

## The gallery is fetched when the dialog opens

Only the cover is fetched with the page. The first version left the rest to
the browser, which meant stepping to an image started its download at that
moment - and a browser keeps painting the image it already has until the new
one decodes. The caption is React state and changes immediately. So for as
long as the fetch took, the reader saw the previous photo captioned as the
next one.

Found by stepping through the FTC gallery in a real browser: image 3 was
on screen as image 2 for long enough to screenshot, with `src` already set
to the right file and `naturalWidth` already correct. Nothing in the DOM was
wrong; the pixels were just stale. A test in jsdom could not have caught it,
because jsdom never decodes an image at all.

Opening the dialog now requests every image in the gallery. That is the
moment the reader commits to looking, and it buys the seconds it takes them
to read the first caption. It costs a fetch for images they might not reach,
bounded by the cap of six.

Keying the `<img>` by `src` would also fix it - React would replace the
element rather than reuse it, so nothing stale could be painted. It trades a
wrong picture for an empty box that collapses the dialog height mid-read.
Showing the reader nothing is more honest than showing them the wrong thing,
but fetching early means neither.

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
- **Bad:** Opening the dialog downloads the whole gallery, so an entry with
  six large photos spends that bandwidth the moment the cover is clicked.
  Acceptable - it is a deliberate act by the reader, and the cap is six - but
  it means image weight is now something to watch when adding them.
- **We will need to revisit this when:** an entry wants video, or when a reader
  on a phone wants to swipe rather than tap arrows.

## Amendment, 2026-09-28: one image opens too

The decision above said an entry with one image "behaves exactly as before,
with no button and no badge". That was wrong, and the Flood Watch poster on the
Harvard entry is what showed it.

A poster is text. At 224px its body copy is about two pixels tall - present as
texture, unreadable as content. It is the image on this page that most needs
enlarging, and under the original rule it was the one image with nothing to
click, because the dialog was reserved for galleries.

The count was never the right test. What decides whether an image should open
is whether it rewards being looked at closely, and a single poster, CAD
screenshot or certificate rewards it more than a third photograph of a robot
does. So the cover is a button whenever there is an image at all. The **badge**
still depends on the count, because `+2` is a statement about how many more
there are and means nothing when there are none.

Consequences of the amendment:

- **Good:** No image on the page is a dead end any more.
- **Bad:** Every entry with a photo now carries an interactive control, which
  sharpens the "Bad" bullet above rather than softening it. Nine entries have
  images today; nine buttons that were not there before.
- **Bad:** The dialog mounts alongside every cover instead of only beside
  galleries. It costs no extra fetch - the dialog opens on `images[0]`, the
  same URL the cover already has - but there is a second `<img>` in the DOM
  per entry, and a test that queried alt text globally started matching twice.
