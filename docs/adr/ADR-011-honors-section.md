# ADR-011: Honors are their own section, and a section that renders nothing leaves the nav

- **Status:** Accepted
- **Date:** 2026-09-07
- **Deciders:** Simra Ali

## Context

Simra's LinkedIn carries five honors her resume does not - President's Award for
Outstanding Academic Excellence, a DEI Award, a National Spanish Exam silver
medal, a Toastmasters Youth Leadership award, and an Honored Citizen award - and
her resume carries two more that no timeline entry claims: FIRST Leadership
Award (Dean's List) Semi-Finalist, and Westford Academy Academic High Honors.

None of them fit the timeline. `timelineEntrySchema` requires a `startDate` in
`YYYY-MM`, and these are dated by year at best and usually not at all. Forcing
them in would mean inventing a month for each, which
[ADR-003](ADR-003-content-model.md) and `CLAUDE.md` both forbid, and it would
put "National Spanish Exam silver medal" in the same visual weight as a
four-week program at MIT.

There is a second problem, and it is the more interesting one. Awards already
live on the page: the FIRST Quality Award is a highlight on the FRC entry, the
BWSI Honorable Mention on the BWSI entry, and three first places on their
project entries. An honors section that lists everything would restate those -
the same fact typed twice, drifting apart the first time one is edited. That is
the failure `CLAUDE.md` names as "never a second source of truth", and an
honors list is the most natural place in a portfolio to introduce it.

Third: this is the first section that is commonly empty. Most people forking
this template have no honors, and `profile.sections` defaults to every id in
`SECTION_IDS`. `LinksBlock` has returned `null` when it has nothing to show
since before this decision, and `AnchorNav` has gone on listing it - a nav link
to `#links` with no `#links` on the page. Nobody noticed because a portfolio
without a single link is rare. A portfolio without honors is not.

## Decision

Honors are a section: `honors` joins `SECTION_IDS`, `honorSchema` joins the
content contract, and `src/components/Honors.tsx` renders it. An honor is a
title, an optional organization, an optional `year` (`"2026"` or
`"2024-2026"` - years, because months do not exist for these), and an optional
one-clause note.

**An honor belongs in exactly one place.** If a timeline entry already carries
it, it does not go in `profile.honors`; the honors section is for the awards
with no entry to sit on. This is a rule about the content, enforced by a comment
in `profile.ts` and by this ADR, not by the schema - see the rejected option
below for why.

Honors sort by their latest year, most recent first, with undated honors last.
Array order in `profile.ts` is not a source of truth - that file gets rewritten
wholesale when a resume is re-imported - which is the same reasoning that makes
`Timeline` sort rather than trust its input.

Separately, `SectionDefinition` gains `isEmpty(profile)`. `Page` computes the
visible sections once and hands the same array to `AnchorNav` and to the page
body, so the nav cannot list a section the page did not render. This fixes the
dangling `#links` anchor as a side effect.

## Options we rejected

### Option: put the honors in the timeline with invented months

The smallest diff: seven more `timelineEntrySchema` entries. It requires making
up a month for each one and it flattens the distinction between a four-week
program and a certificate. Rejected on the "never invent content" rule, which
covers dates.

### Option: a flat list of strings

`honors: string[]`, one line each. Tempting, and it loses the ability to render
the year as a distinct piece of metadata or to sort by it - the moment you want
either, you are parsing the string you should have kept structured. Cheap now,
a migration later.

### Option: let honors also live on timeline entries, and de-duplicate in code

Keep the awards on their entries *and* list them all in honors, with the
component filtering out anything whose text appears in a highlight. This is
string matching against prose, it breaks the first time a highlight is reworded,
and it hides a content decision inside a component. The rule "an honor belongs
in exactly one place" is a decision a person makes once while writing the
content, not a comparison a component makes on every render.

### Option: enforce no-duplication in the schema or a test

Considered, and it is the kind of test `CLAUDE.md` warns about: it would assert
something about the person's resume rather than about the code, and the only
way to satisfy a false positive would be to delete a true honor. A fuzzy string
match between honors and highlights would fail on "First place at Microsoft
NERD GirlHacks" versus "Microsoft NERD GirlHacks 1st Place" anyway.

### Option: hide the empty section but leave `AnchorNav` alone

Ship the honors section and keep the pre-existing dangling-anchor behaviour,
since it was already there for links. Rejected because this change makes it
likely rather than theoretical: the default `sections` includes `honors`, and
most people forking this have none. `tests/sections.test.tsx` already asserted
"never points a nav link at something that is not on the page" - it passed only
because the fixture always had links.

## Consequences

- **Good:** Seven real honors are on the page, and none of them needed a made-up
  date or a duplicated fact.
- **Good:** `Page` now derives one array of visible sections and both consumers
  read it, which is the ADR-006 property extended to emptiness rather than a
  second filter that has to agree with the first.
- **Bad:** "An honor belongs in exactly one place" is a convention. Nothing
  fails if someone breaks it; they get the same award twice on one page.
- **Bad:** `SectionDefinition` has a third field, and every future section has
  to answer the emptiness question. That is the correct question to make people
  answer, but it is one more thing.
- **We will need to revisit this when:** honors want dates finer than a year, or
  when someone wants them ordered by prestige rather than recency - at which
  point the order is a property of the person and belongs in the content, the
  way `profile.sections` already is.
