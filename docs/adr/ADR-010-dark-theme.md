# ADR-010: The site is dark, and the theme lives entirely in the token values

- **Status:** Accepted
- **Date:** 2026-09-07
- **Deciders:** Simra Ali

## Context

The template shipped light: a near-white page, dark text, a violet accent. The
ask was "make it dark mode."

That phrase has two readings. One is "support a dark appearance when the
viewer's OS asks for it" - a `prefers-color-scheme` block, both palettes
maintained forever. The other is "this site is dark" - a design decision, one
palette. The audience here is college admissions readers and people who find
the page from a LinkedIn link, and the page is a portfolio for a robotics and
autonomous-systems engineer. A committed dark page is a deliberate look for
that audience; a page that silently renders light on a reviewer's default-light
laptop does not read as "she made it dark," it reads as nothing happened.

The mechanism matters as much as the palette. `src/styles/globals.css` says, in
a comment older than this decision, that changing the values in `@theme`
changes the whole site. That is very nearly true. The exceptions were three
literal `white`s used as *surfaces* - the tag chips in `TimelineEntry`, and the
card gradient and link buttons in `LinksBlock`. Under a dark palette those stay
white and punch three holes in the page. `text-white` on a filled `brand-600`
button is a different thing and stays white in both worlds, because it sits on
a colour we control rather than on the page.

## Decision

The site is dark. There is one palette, defined once in the `@theme` block in
`src/styles/globals.css`, and `html` declares `color-scheme: dark` so the
browser's own furniture - scrollbars, focus rings, form controls - matches.

Token *names* keep their roles rather than their lightness. `ink-50` is still
"the page", `ink-950` is still "a heading", `brand-700` is still "brand-coloured
text" - so `ink-50` is now the darkest ink and `brand-700` the lightest brand,
and the component classes did not move. A new `--color-surface` token names the
one thing the ink scale could not: a panel raised off the page. The three
literal surface `white`s become `bg-surface` / `to-surface`.

No component gained a conditional class, a theme prop, or a `dark:` variant.

## Options we rejected

### Option: `@media (prefers-color-scheme: dark)` with both palettes

The conventional answer, and the one to take if this were a product. Rejected
for a portfolio: it doubles the palette that has to stay contrast-checked, and
it means the person the page was made for cannot predict what a reviewer sees.
"Make it dark" was a decision about how the page looks, not about how it
negotiates. If a light palette is ever wanted back, this ADR is a diff of one
block, and that is the point of keeping the theme in the tokens.

### Option: a light/dark toggle button

More control, and a real cost: state, persistence, a control in the header, an
accessible name for it, and the first thing on the page becoming a settings
widget rather than her name. It also needs both palettes maintained, so it
carries the option above plus a component. Worth doing if she wants it; not
worth doing to answer "make it dark."

### Option: `dark:` variants on every component

Tailwind's own idiom, and it puts the theme back in forty places across seven
components - which is the exact "second source of truth" that ADR-003 forbids
for content and that the `@theme` comment was written to prevent for colour. It
would also have made every component file longer against a 200-line budget.

### Option: keep the ink scale monotonic and renumber the component classes

The tidy-minded alternative: leave `ink-50` meaning "lightest", and change every
component to say `ink-950` where it used to say `ink-50`. Honest about the
scale, and it touches every file to express a decision that belongs in one. The
scale is read as roles in this codebase anyway - nothing does arithmetic on the
numbers.

## Consequences

- **Good:** The whole theme is about twenty values in one block. Changing the
  accent hue, or going back to light, is one edit and no component churn.
- **Good:** `--color-surface` gives the page a vocabulary it was missing, and
  the literal `white`s that would silently break any future palette are gone.
- **Bad:** The token numbers no longer describe lightness. `ink-50` is the
  darkest ink on the page, and anyone arriving from another Tailwind codebase
  will read that backwards exactly once. The comment in `globals.css` says so.
- **Bad:** Viewers who prefer light get dark anyway. That is the decision, not
  an oversight, but it is a real cost to a real group of people.
- **We will need to revisit this when:** she wants a toggle, or when a second
  palette appears for any reason - at which point the roles established here are
  what makes `prefers-color-scheme` a small change rather than a rewrite.
