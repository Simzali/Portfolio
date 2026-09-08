import { Accessibility, Braces, Coffee, Compass, Palette, Tag, Wrench } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { iconForEntry, iconForTag } from '../src/components/icon-map';
import { profile } from '../src/content/profile';

/**
 * `TAG_ICONS` is an ordered list matched by substring, which makes two things
 * true that a plain lookup table would not: a broad needle placed too high
 * silently swallows a narrow one, and appending in the wrong spot is an easy
 * mistake to make and a hard one to see. These are the orderings that are
 * load-bearing. See docs/adr/ADR-009-tag-icon-vocabulary.md.
 */
describe('tag icon ordering', () => {
  it('does not let "java" steal "JavaScript"', () => {
    expect(iconForTag('JavaScript')).toBe(Braces);
    expect(iconForTag('Java')).toBe(Coffee);
  });

  it('reads "Mechanical Design" as mechanical, not as visual design', () => {
    expect(iconForTag('Mechanical Design')).toBe(Wrench);
    expect(iconForTag('Design')).toBe(Palette);
  });

  it('recognises assistive technology separately from accessibility', () => {
    expect(iconForTag('Assistive Tech')).toBe(Accessibility);
    expect(iconForTag('Accessibility')).toBe(Accessibility);
  });
});

/**
 * The reason the vocabulary was extended at all: the covers are the main visual
 * on the page, and an unrecognised tag set makes every entry look the same.
 *
 * This asserts a property of the icon map, not of the person - it derives its
 * expectations from whatever `profile.ts` happens to contain, so it stays
 * meaningful when someone replaces the content with their own.
 */
describe('entry covers stay distinguishable', () => {
  it('gives every timeline entry a recognised icon rather than the fallback', () => {
    for (const entry of profile.timeline) {
      expect(
        iconForEntry(entry.tags),
        `${entry.id} has no tag the icon map recognises: ${entry.tags.join(', ')}`,
      ).not.toBe(Compass);
    }
  });

  it('does not give most entries the same icon', () => {
    const icons = profile.timeline.map((entry) => iconForEntry(entry.tags));
    const distinct = new Set(icons).size;

    // Not "all different" - two entries about the same thing should look alike,
    // and requiring uniqueness would be a rule about the resume rather than the
    // code. Half is the point where the page reads as a list of varied work.
    expect(distinct * 2).toBeGreaterThanOrEqual(icons.length);
  });

  it('falls back to a generic tag for something it has never heard of', () => {
    expect(iconForTag('Underwater Basket Weaving')).toBe(Tag);
  });
});
