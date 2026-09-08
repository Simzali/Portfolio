import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Highlights } from '../src/components/Highlights';
import { highlightSchema, profileSchema } from '../src/content/schema';
import { profile } from '../src/content/profile';

/**
 * The band that carries the four facts a visitor gets if they read nothing
 * else. See docs/adr/ADR-013-hero-highlights.md.
 */

const item = (over = {}) => ({ value: 'A fact', label: 'What it is', ...over });

describe('the highlights band', () => {
  it('renders nothing when there is nothing to highlight', () => {
    const { container } = render(<Highlights items={[]} />);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('links a highlight that has a source and leaves the rest as plain text', () => {
    const { container } = render(
      <Highlights
        items={[
          item({ value: 'Sourced', href: 'https://example.org/proof' }),
          item({ value: 'Unsourced' }),
        ]}
      />,
    );

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('https://example.org/proof');
  });

  it('gives a sourced highlight an accessible name that says it is a source', () => {
    const { getByRole } = render(
      <Highlights items={[item({ value: '#1 in MA', href: 'https://example.org/proof' })]} />,
    );

    // Without this the link announces as a bare statistic, which tells a screen
    // reader user the number but not that following it proves anything.
    expect(getByRole('link').getAttribute('aria-label')).toContain('Source');
  });
});

describe('the highlight contract', () => {
  it('caps the band at four, because a fifth cell cannot be read on a phone', () => {
    const five = Array.from({ length: 5 }, (_, i) => item({ value: `Fact ${i}` }));
    expect(profileSchema.safeParse({ ...profile, highlights: five }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, highlights: five.slice(0, 4) }).success).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    '//evil.example/proof',
  ])('rejects %s as a highlight source', (href) => {
    expect(highlightSchema.safeParse(item({ href })).success).toBe(false);
  });

  it('requires a source to be https, not a path on this site', () => {
    // A highlight cites something external by definition; a relative path here
    // is almost always a mistake rather than a citation.
    expect(highlightSchema.safeParse(item({ href: 'https://example.org' })).success).toBe(true);
  });

  it('gives every real highlight both a value and a label', () => {
    for (const highlight of profile.highlights) {
      expect(highlight.value.trim().length).toBeGreaterThan(0);
      expect(highlight.label.trim().length).toBeGreaterThan(0);
    }
  });
});
