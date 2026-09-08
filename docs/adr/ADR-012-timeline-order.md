# ADR-012: Ongoing timeline entries sort by how long they have been running

- **Status:** Accepted
- **Date:** 2026-09-07
- **Deciders:** Simra Ali

## Context

`Timeline` has sorted the same way since the template was written: still-going
entries first, then everything else by end date, most recent first, with ties
broken on start date descending. "Most recent first" is the right instinct and
it produced a bad result on this particular resume.

Five entries are ongoing. Four of them started in September 2023 - the FRC team
she co-captains, the FTC team, the outreach work, and the broadcasting club -
and one started in September 2024. Sorting ongoing entries by *most recent
start* put the newest commitment at the top of the page and pushed three years
of robotics leadership below it. The first thing a reader saw was the thing she
had been doing the least long.

That is backwards for the group specifically. Among things that are all still
true, "when did you start" is not a recency signal at all - every one of them is
equally current. What distinguishes them is how long they have been held, and a
three-year commitment says something a three-month one does not.

Finished entries are a different case and the old rule was right about them.
Something that ended in 2019 is not more interesting for having lasted four
years; it is still over. Recency is the signal that matters once a thing has
stopped.

## Decision

The comparator has four steps:

1. Still going (`endDate: null`) sorts above finished, whatever the dates say.
2. Two finished entries: the one that ended most recently first.
3. Otherwise - two ongoing entries, or two that ended in the same month - the
   one that started **earliest** first, because it has been running longest.
4. A genuine tie returns `0`, and `Array.prototype.sort` is stable, so those
   entries keep the order they have in `profile.ts`.

Step 4 is a deliberate promotion of an accident to a documented property. Four
of these entries tie exactly, and something has to decide which leads. The order
the author wrote them in is the only signal available that is about the person
rather than about the calendar, so the array becomes the tie-break - the one
place in the timeline where a preference can be expressed. The header comment in
`profile.ts` still says ordering does not matter, and that stays true for
everything the dates can separate.

## Options we rejected

### Option: sort ongoing entries by duration explicitly

Compute months elapsed and sort descending. Identical output - for an ongoing
entry, "longest running" and "earliest start" are the same fact - and it needs a
clock. A comparator that reads `Date.now()` sorts differently depending on when
the test runs, and it makes a pure function into one that is not.

### Option: let the author order the whole timeline in `profile.ts`

Drop sorting, render the array. Maximum control, and it deletes the property the
sort exists for: `profile.ts` is rewritten wholesale when a resume is
re-imported, and nothing carries the intended order across that. It also puts
the burden of keeping eleven entries in date order on a human.

### Option: an explicit `priority` or `featured` field on the entry

Honest about what is really wanted - "show the co-captaincy first" - and it adds
a ranking to the content contract that has to be maintained by hand for every
entry, forever, and that quietly becomes a second sort key nobody remembers.
Step 4 gets the same result from data that already exists.

### Option: sort ongoing by start date descending, as before, and reorder the
### resume instead

Move the FRC entry to the top of the array and hope. It does not work: the old
comparator sorted ongoing entries by start date, so the 2024 entry beat the 2023
ones regardless of array position. The array only matters once the dates tie,
which is what step 3 arranges.

## Consequences

- **Good:** The page now opens with three years of robotics leadership instead
  of the most recently acquired commitment.
- **Good:** The rule is still pure, still deterministic, and still derived
  entirely from the dates. No clock, no new content field.
- **Bad:** Two rules for two groups is harder to hold in your head than one, and
  someone reading only the finished half will conclude the timeline sorts by
  recency and be surprised by the top of the page.
- **Bad:** The array-order tie-break is invisible. Someone who reorders
  `profile.ts` expecting nothing to happen will move the top entry, and the
  comment in that file says ordering does not matter.
- **We will need to revisit this when:** two ongoing entries tie and the author
  wants a specific one first often enough that reordering the array stops
  feeling like a trick.
