# ADR-009: The tag icon vocabulary covers hardware and people, not just web stacks

- **Status:** Accepted
- **Date:** 2026-09-07
- **Deciders:** Simra Ali

## Context

`src/components/icon-map.ts` maps a free-text tag onto a Lucide icon, and
`iconForEntry` picks the most *specific* recognised tag to stand for a whole
timeline entry on its generated cover. Unrecognised tags fall back to a generic
`Tag`, and an entry whose tags are all unrecognised falls back to `Compass`.

The vocabulary the template shipped with was built around the example resume:
React, TypeScript, Python, Netlify, Leaflet, GTFS. That is a reasonable starting
set for a web portfolio and a bad one for this resume. Filling in `profile.ts`
produced eleven entries tagged `SolidWorks`, `Onshape`, `CAD`, `Computer
Vision`, `SLAM`, `Drones`, `Autonomous Systems`, `Control Systems`, `RF`,
`Signal Processing`, `Ultrasonic`, `Outreach`, `Mentorship`, `Teaching`,
`Leadership`. Exactly two of those matched anything: `Python` and the substring
`data`.

The result was a page where nearly every tag chip carried the same grey label
icon and nine of eleven entry covers carried the same compass - the specific
failure the specificity ranking exists to prevent, reintroduced by a vocabulary
that only knows one domain. The covers are the main visual on the page, and the
fallback made a varied resume look like one repeated item.

There is a second gap, and it is not about robotics. Half of what is on an
engineering resume is not a technology: mentoring, outreach, teaching,
leadership, competitions. The original list had no needle for any of them, so a
club someone founded scored zero and lost the entry icon to whatever language
tag sat beside it.

## Decision

We extend `TAG_ICONS` with two groups of needles - mechanical/robotics/hardware,
and people-and-leadership - and we treat the ordering of the array as part of
the contract rather than an accident. `lookup` returns the first needle
*contained in* the tag, so a narrow needle has to sit above any broader needle
it would otherwise lose to: `mechanical` above `design`, `javascript` above
`java`, and `rf` last because it is a substring of ordinary English. The array
now says so in a comment, and `tests/icon-map.test.ts` asserts the three
orderings that are load-bearing.

The fallback behaviour, the specificity ranking, and both exported functions are
unchanged. This is a vocabulary change, not a mechanism change.

## Options we rejected

### Option: leave it alone and pick different tags in `profile.ts`

Tag every entry with `Python`, `React` or `Data` so it hits an existing needle.
This is writing the content to fit the code, which is backwards, and it makes
the tags less honest - `SolidWorks` is what the work was. It also does nothing
for the next person, who will hit the same wall with whatever their domain is.

### Option: give every tag its own icon

Skip the substring matching and map each exact tag string. Precise, and it
scales badly: every new tag is a code change, and `Computer Vision` and
`Vision` become two entries that have to be kept in step. The substring match is
the thing that lets someone write their resume's words rather than ours.

### Option: put the icon name in `profile.ts`

Add an `icon` field to `timelineEntrySchema` and let the author choose. It is
the most flexible option and we rejected it anyway: it puts a Lucide identifier
into the content file, which means the content file now knows about the icon
library, and a typo there is a runtime blank instead of a type error. The whole
point of `profile.ts` is that it contains facts about a person, not rendering
instructions. See ADR-003.

### Option: an emoji per tag

Cheap, no imports, works everywhere. It also looks like a chat message rather
than a portfolio, renders differently on every platform, and screen readers
announce emoji names we did not choose. The icons are `aria-hidden` and the tag
text carries the meaning; emoji would put untested text into the accessibility
tree.

## Consequences

- **Good:** Entry covers are visually distinct again - eleven entries, nine
  different glyphs - without anyone choosing a colour or an icon.
- **Good:** The vocabulary now covers mentoring, outreach and competitions, so
  a leadership entry is not out-scored by a language tag sitting next to it.
- **Bad:** Substring matching over an ordered list is order-dependent, and the
  order is easy to break by appending in the wrong place. The tests cover the
  three cases we know about, not the general property.
- **Bad:** More icons imported means a slightly larger bundle. Lucide is
  tree-shaken per icon, so it is roughly twenty small SVG components.
- **We will need to revisit this when:** the list gets long enough that reading
  it top to bottom is how you find a bug, or when someone wants a domain we
  have not thought of and we are tempted to add a fourth group. At that point
  the right move is probably exact-match-then-substring, not a longer list.
