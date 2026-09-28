# ADR-014: An entry's organization wraps as one piece, or not at all

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Simra Ali

## Context

Every timeline entry heading is one line of text: the role, then a separator,
then the organization.

```
Computer Vision Software Developer, Onshape CAD Designer · FIRST Tech Challenge - Ghost Robotics 3565
```

Both halves have grown. Roles are now named rather than gestured at
("Computer Vision Software Developer" where it once said "Vision Software"),
and the organizations were always long, because FIRST names its programmes at
length and the team number comes after the team name.

The result is that the heading wraps, and because the whole thing is one run of
inline text it wraps wherever the line happens to run out. Measured at 885px,
three organizations break across two lines mid-phrase:

- `· FIRST Robotics Competition - Stormgears 5422`
- `· FIRST Tech Challenge - Ghost Robotics 3565`
- `· Harvard Summer School`

"FIRST Tech" on one line and "Challenge - Ghost Robotics 3565" on the next is
harder to read than the same text set as two whole phrases, and it looks like a
mistake rather than a layout. The role and the organization are two different
facts; a break between them is meaningful, a break inside either is noise.

## Decision

The organization is an `inline-block`, and the space that separates it from the
role moves outside the span.

Those two changes together do one thing: the browser is given a break
opportunity *before* the organization and none inside it, so the organization
either sits beside the role or moves to the next line whole.

The separator space has to move out of the span because an `inline-block`
keeps its own leading whitespace, which would indent the organization by a
space every time it wrapped.

This is not `white-space: nowrap`. An organization longer than the line it sits
on must still be allowed to break, or it would push the page wider than the
viewport - and the page has to work at 320px, where
"FIRST Robotics Competition - Stormgears 5422" is wider than the column no
matter what. `inline-block` degrades correctly: it breaks internally only when
it cannot fit on a line by itself.

## Options we rejected

### Option: put the organization on its own line always

A `<span class="block">`, or a second element under the heading. Predictable,
and it spends a line on every one of fifteen entries to fix three of them. The
short ones - "Firefly · Girls Who Code game design project" - read better on
one line, and the timeline is long enough already.

### Option: `white-space: nowrap`

The direct reading of "don't split it". It overflows the page at 320px, which
[CLAUDE.md](../../CLAUDE.md) forbids outright, and an overflowing heading is a
worse failure than an awkward break.

### Option: shorten the organization strings

"FTC - Ghost Robotics 3565" instead of "FIRST Tech Challenge - Ghost Robotics
3565". It fixes the symptom by removing information, and the full programme
name is what an admissions reader recognises. Content should not be cut to
accommodate a layout that can be fixed.

### Option: `text-wrap: balance` on the heading

Tempting, and it optimises for even line lengths rather than for keeping
phrases intact - it would still break inside the organization if that produced
a tidier rag. The heading already uses `text-pretty`, which is the related
property that avoids orphans; neither addresses where the break lands.

## Consequences

- **Good:** A heading that wraps now reads as two phrases, which is what it is.
- **Good:** Nothing changes for the entries that already fit on one line.
- **Bad:** A wrapped heading is sometimes more ragged than it was, because the
  first line now ends early rather than filling. That is the trade: a shorter
  first line in exchange for an organization that stays in one piece.
- **We will need to revisit this when:** a role title grows long enough that it
  wraps internally too, at which point the role wants the same treatment and
  the two probably want to be separate elements rather than one heading.
