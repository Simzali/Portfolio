# ADR-016: The author can name entries that lead the timeline

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Simra Ali

## Context

[ADR-012](ADR-012-timeline-order.md) sorts the timeline from the dates alone:
still-going entries first, then the most recently finished, with duration
breaking ties. It ends with a prediction:

> **We will need to revisit this when:** two ongoing entries tie and the author
> wants a specific one first often enough that reordering the array stops
> feeling like a trick.

This is that moment, and it arrived in a stronger form than the prediction
allowed for. Three requests, in quick succession: put **Autonomous Air Vehicle
Racing** (MIT Beaver Works, July-August 2026) directly after the FTC entry, then
**Women in Technology** (BAE Systems) after that, then **Harvard Summer School**
after that.

No date rule can do any of it. All three are *finished*, and ADR-012's first
step puts every ongoing entry above every finished one, whatever the dates say.
Three ongoing entries sit in between, and all three are correctly there by the
rule. The array-order tie-break does not reach across the two groups. There is
no ordering of `profile.ts`, and no adjustment of the comparator that stays
derived from dates, that produces the requested page.

The rule is not wrong. "Something still running outranks something finished" is
right nearly always, and the alternative - letting a recently-finished thing
outrank a three-year commitment - would be worse in every other case on this
page. What is missing is a way to say the one thing the dates cannot express:
*this one matters more than its dates suggest.*

## Decision

`profile.timelineLead` is a list of timeline entry ids. Those entries run first,
in exactly the order given. Everything not named follows underneath, sorted by
the ADR-012 rules, entirely unchanged.

```ts
timelineLead: [
  'stormgears-frc-5422',
  'ghost-robotics-ftc-3565',
  'bwsi-autonomous-air-vehicle-racing',
  'bae-women-in-technology',
  'harvard-summer-robotics-ai',
],
```

Read as a sentence, that is: the two robotics teams, then the three selective
programmes. It is an editorial claim about what a reader should meet first, and
it is the kind of claim only a person can make.

Five ids express three preferences - FRC and FTC are named only to hold their
positions above the programmes. That is a real cost of a "lead" list over a
per-entry rank, and it is accepted because it makes the whole claim legible in
one place, in order, rather than scattered across five entries as numbers that
have to be mentally re-sorted.

**A lead id that matches no entry is a schema error.** This is the part worth
insisting on. A mistyped or renamed id would otherwise do nothing at all: the
entry would sit exactly where the dates put it, which is indistinguishable from
the feature not working. Silent no-ops are the worst failure mode available
here, so `profileSchema` resolves every id against the timeline and names the
offending one.

Empty is the default and stays the normal case for anyone else using this
template. The dates decide everything unless someone says otherwise.

## On the size of the list

The first draft of this ADR said the decision should be revisited if the list
ever grew past about four ids. It reached five before the ADR was committed.

That number was arbitrary and the reasoning behind it was wrong. Five is not a
warning sign here, because the split is not five-versus-nothing - it is five
curated entries over ten that are still doing fine on dates alone. The real
threshold is not a count at all: it is whether the unnamed remainder is still
large enough that sorting it is doing useful work. Ten entries is. Two would not
be, and at that point the honest move is to admit the timeline is hand-ordered
and delete the comparator rather than keep a sort that decides almost nothing.

This is recorded rather than quietly edited away because the speed of it is the
finding. A mechanism introduced as a narrow exception absorbed two more cases
within the hour, which is what an escape hatch does when the underlying rule is
right but incomplete.

## Options we rejected

### Option: a `featured` or `priority` field on the entry

ADR-012 rejected this and the objection still holds: a ranking on the content
contract that has to be maintained by hand for every entry, forever, and that
quietly becomes a second sort key nobody remembers. A `lead` list is the same
capability with the opposite default - entries say nothing about rank, and one
short list in one place says everything. It is also self-describing in a way a
per-entry field is not: five numbers spread across five entries do not tell you
the running order without collecting them first.

### Option: change the comparator so recently-finished entries can outrank ongoing ones

Say, anything finished within the last three months sorts as though ongoing. It
gets today's page and it is a worse rule: it needs a clock, which ADR-012
rejected for making the sort non-deterministic; the page would silently reorder
itself in October; it still would not place BAE and Harvard, which ended in May
2026 and August 2025; and it encodes "recent short course beats three-year
commitment" as a general law, which is the opposite of what ADR-012 established.

### Option: drop the sort and order the array by hand

Rejected in ADR-012 and still rejected, though less comfortably than before now
that a third of the timeline is named explicitly. It moves fifteen entries'
worth of date ordering onto a human and loses it entirely when `profile.ts` is
regenerated from a resume. `timelineLead` keeps the sort doing the work it is
good at and takes away only the part it cannot do.

### Option: leave it, and explain that the sort knows best

The sort does not know best. It knows the dates. "Four weeks at MIT flying
autonomous drones" is the kind of thing an admissions reader should meet early,
and no amount of date arithmetic contains that fact.

## Consequences

- **Good:** The one thing the dates cannot express can now be said, in one
  place, in a form a reader of `profile.ts` understands without reading the
  comparator.
- **Good:** Everything unnamed is still sorted, still pure, still deterministic.
  The default behaviour of the file is unchanged.
- **Good:** A stale id fails loudly at the schema, so renaming an entry cannot
  silently drop it out of the lead.
- **Bad:** There are now two ways an entry's position is decided, and the page
  no longer tells you which one applied. Someone debugging the order has to
  check `timelineLead` before reasoning about dates at all.
- **Bad:** Holding a position costs an id. Placing anything new above Harvard
  means editing this list too, and forgetting to is not an error - just a page
  that quietly says something slightly different.
- **We will need to revisit this when:** the unnamed remainder gets small enough
  that the comparator is deciding almost nothing. Then the timeline is
  hand-ordered in practice and should say so.
