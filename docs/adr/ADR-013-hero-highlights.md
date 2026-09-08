# ADR-013: The hero carries a highlights band, and entries carry their sources

- **Status:** Accepted
- **Date:** 2026-09-08
- **Deciders:** Simra Ali

## Context

The page opens with a name, a headline, a photo and a paragraph, and then drops
straight into fourteen timeline entries. Everything on it is true and nothing on
it is fast. A reader who gives the page fifteen seconds - which is what a
portfolio link in an application actually gets - leaves with an impression
rather than a fact.

The facts exist; they are just distributed. "Ranked #1 in Massachusetts and #10
in the world out of 7,800+ teams" is the single hardest number Simra has, and it
sits in the third bullet of the second timeline entry. Three first-place
finishes are spread across three separate project entries near the bottom. A
reader has to assemble the case themselves.

The same redesign for her resume solved this with a four-cell band directly
under the contact line, and it worked: it gives the eye somewhere to land and it
front-loads the numbers. The portfolio has the same problem and should get the
same treatment.

Separately, the page asserts a lot and evidences none of it. Every claim is
Simra's word. Several of those claims have public sources - the FIRST event
system publishes award results, "The Bat" has a live project site, HireAble has
one, her team publishes outreach write-ups - and `timelineEntrySchema` already
has a `links` array that was going unused on all but one entry.

## Decision

**`profile.highlights`** is a new content field: at most four items, each a
`value` (the fact), a `label` (what it is), and an optional `href`. `Hero`
renders them as a band under the intro. Four is a cap in the schema, not a
convention - a fifth cell makes every cell too narrow to read on a phone, and
the constraint is the point of the element.

The band lives in the hero rather than in `SECTION_IDS` because it is not a
section: it has no heading, no anchor, and it is meaningless anywhere except
directly under the name. `profile.sections` reorders sections; this is not one
of them, for the same reason the hero itself is not. See ADR-006.

**Sourcing** needs no schema change. Entries get `links` populated with real,
checked URLs, and the honors that can be sourced are linked from the highlight
that carries them. Every URL added was fetched and confirmed to return 200
before it went in - a dead link on a portfolio is worse than no link, because it
reads as a claim that was never true.

## Options we rejected

### Option: a "Highlights" section in `SECTION_IDS`

Consistent with how everything else on the page is built, and wrong: it would
get a heading, an anchor and a position in `profile.sections`, which implies it
could sit below the links block. A summary that appears after the evidence is
not a summary. It belongs to the hero or nowhere.

### Option: derive the highlights from the timeline

Compute them - most recent award, count of entries tagged "1st Place". It
removes a content field and it cannot work: "out of 7,800+ teams" is not
derivable from anything the schema holds, and the judgement of which four facts
matter is exactly the judgement a person should be making. Deriving it would
mean encoding that judgement in code, where it is harder to change than a line
in `profile.ts`.

### Option: put the sources in a references section at the bottom

Academic, tidy, and nobody clicks it. A link is useful next to the claim it
supports, at the moment the reader is deciding whether to believe it.

### Option: link everything that has a URL

There is a LinkedIn post, a Devpost profile, a Harvard course catalogue page and
a BAE program page among the sources found. Linking all of them turns the page
into a link farm and dilutes the two that matter - the live project sites, which
let a reader *use* the thing she built. Entries get at most two links, and the
bar is "does this let someone verify or experience the claim".

## Consequences

- **Good:** The four hardest facts are above the fold, and three of them are one
  click from a source that is not Simra's own assertion.
- **Good:** `links` on `timelineEntrySchema` finally does the job it was
  designed for, with no schema change.
- **Bad:** The band duplicates facts that also appear in the timeline. That is
  deliberate - a summary repeats by definition - but it is now two places to
  edit when a number changes, and nothing enforces that they agree.
- **Bad:** External links rot. These were all verified on 2026-09-08; nothing
  re-checks them, and a 404 two years from now looks worse than no link.
- **We will need to revisit this when:** the highlights and the timeline
  disagree because only one was updated, or when someone wants a fifth cell -
  at which point the honest answer is that a fifth fact means one of the four
  was not a highlight.
