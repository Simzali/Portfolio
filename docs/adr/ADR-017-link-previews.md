# ADR-017: The served HTML carries link-preview tags

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Simra Ali

## Context

The page's `<head>` carried three tags: charset, viewport, and a description.
Measured on the deployed site, nothing else.

That is enough for a browser tab and a search result, and it is not enough for
the thing this page is actually for. A portfolio is pasted into places:
a LinkedIn post, a message to a coach, an email to an admissions officer, the
additional-information box on an application. In every one of those, the URL is
expanded into a card by a crawler, and the card is built from Open Graph tags.
With none present, the link renders as a bare blue URL - no image, no title
card, no description.

Fifteen timeline entries, sixteen images and a hand-checked résumé are all
invisible at the exact moment the link is shared.

Two facts about this site made it worth fixing properly rather than pasting in
a couple of tags.

**Crawlers do not run JavaScript.** This is a React single-page app; a component
setting `document.head` would be correct in a browser and useless to every
preview service. The tags have to be in the HTML that is served. The build
already does exactly this for the title and description, through the token
substitution in `vite.config.ts` described in
[ADR-003](ADR-003-content-model.md) - so the machinery existed and simply
stopped short.

**`og:image` must be absolute.** A relative path is not resolved against the
page URL by these crawlers; it is dropped. A card with a relative image renders
with no picture at all, which looks identical to having written no tags.

## Decision

`index.html` gains one more token, `__SOCIAL_META__`, filled at build time from
`profile.ts` like the other two. `socialMetaTags()` emits Open Graph plus the
two Twitter tags nothing else covers.

Two fields join the content contract:

- **`siteUrl`** - where the site lives. It exists only to build absolute URLs.
- **`socialImage`** - reuses `imageSchema`, so the card picture gets the same
  URL checking and the same required alt text as every image on the page.

**Without `siteUrl` the image tags are omitted and the card falls back to
`summary`**, the small text-only layout. That is the important half of the
decision. The tempting alternative - emit `og:image="/social-card.jpg"` and hope
- produces a card that is silently broken everywhere, and broken in a way the
author cannot see from their own machine. Omitting is honest: a text-only card
is visibly text-only.

## The card image is built, not reused

`og:image` is cropped to 1.91:1 by every major preview. The chosen picture, the
FTC 3565 robot, is square: handing it over directly would let each platform pick
its own crop of the middle band, which loses the arm at the top and the `3565`
plate at the bottom - the two things that identify it.

So `public/social-card.jpg` is a 1200x630 canvas with the robot *contained*
rather than cropped, on a background sampled from the photo's own corner, which
for a product shot on white is invisible. Nothing is clipped, and no platform
gets to decide what to cut.

## Options we rejected

### Option: set the tags from React

`document.head` is reachable from a component and this is a single-page app, so
it looks like the natural home. It does nothing: no preview crawler executes
JavaScript. The tag would be correct in a browser's DevTools and absent from
every card, which is the worst kind of wrong - it tests fine by hand.

### Option: hardcode the tags in `index.html`

Fastest, and it puts the name, the headline and the site URL back into a second
file - the exact thing ADR-003 exists to prevent, in the exact file where it
happened before.

### Option: read the site URL from Netlify's `URL` environment variable

Free, always correct on Netlify, and correct for deploy previews too. It also
moves a piece of content out of `profile.ts` and into the deploy environment,
where it is invisible to anyone reading the project, and it produces no tags at
all on a local build. A custom domain later is one line in `profile.ts` either
way.

### Option: use the existing avatar as the card image

No new file. The avatar is a 512px square crop of a person, chosen to work at
112px in a circle-ish frame; at 1200x630 it is both too small and the wrong
subject for a card about the work.

## Consequences

- **Good:** A pasted link now renders as a card with the robot, the name and the
  headline, in every service that reads Open Graph.
- **Good:** The card image is fixed at 1200x630 and nothing is cropped, so it
  looks the same everywhere rather than differently on each platform.
- **Good:** Still one source of truth. The name and headline in the card are the
  same strings as the `<h1>` and the browser tab.
- **Bad:** `siteUrl` is a content field that will be wrong and silently wrong if
  the site moves to a custom domain - every preview would point at the old host
  while the page itself worked fine. The comment in `profile.ts` says so.
- **Bad:** The card image is a third copy of the robot photo in `public/`, after
  the entry cover and the dialog image. 95kB, and it is never fetched by a
  visitor - only by crawlers.
- **We will need to revisit this when:** the site gets a custom domain, or when
  a preview should show something other than one fixed picture.
