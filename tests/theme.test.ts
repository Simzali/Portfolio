import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The theme lives in one place, and this is what keeps it there.
 *
 * The site is dark and has no `dark:` variants, no theme prop, and no second
 * palette - every colour resolves through a token in `@theme`. That only holds
 * while nothing hardcodes a colour, and the way it broke the first time was
 * three literal `white`s used as *surfaces*: they survived the palette change
 * and punched holes in the page.
 *
 * See docs/adr/ADR-010-dark-theme.md.
 */

const COMPONENTS = join(process.cwd(), 'src', 'components');
const THEME = readFileSync(join(process.cwd(), 'src', 'styles', 'globals.css'), 'utf8');

function componentSources(): Array<[name: string, source: string]> {
  return readdirSync(COMPONENTS)
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => [file, readFileSync(join(COMPONENTS, file), 'utf8')]);
}

describe('the dark theme is the only theme', () => {
  it('declares color-scheme, so the browser draws its own furniture dark', () => {
    expect(THEME).toMatch(/color-scheme:\s*dark/);
  });

  it('defines a surface token for panels raised off the page', () => {
    expect(THEME).toMatch(/--color-surface:/);
  });

  it('keeps the page darker than the text that sits on it', () => {
    const lightness = (token: string) => {
      const found = new RegExp(`--color-${token}:\\s*oklch\\(([\\d.]+)`).exec(THEME);
      if (!found) throw new Error(`--color-${token} is not defined in globals.css`);
      return Number(found[1]);
    };

    // Roles, not a lightness ladder - this is the assertion that catches a
    // half-applied palette, where the page went dark and the body copy did not.
    expect(lightness('ink-50')).toBeLessThan(lightness('ink-800'));
    expect(lightness('ink-50')).toBeLessThan(lightness('surface'));
    expect(lightness('surface')).toBeLessThan(lightness('ink-600'));
    // brand-700 is text on the page; brand-600 is a fill that carries white.
    expect(lightness('brand-700')).toBeGreaterThan(lightness('brand-600'));
  });
});

describe('no component hardcodes a surface colour', () => {
  it.each(componentSources())('%s uses bg-surface rather than a literal white', (_name, source) => {
    // `text-white` is deliberately allowed: it sits on a filled brand-600 or on
    // a generated cover gradient, both colours we control, and it stays white
    // whatever the page does.
    const literalSurfaces = source.match(/\b(?:bg|to|from|via)-white\b/g) ?? [];
    expect(literalSurfaces).toEqual([]);
  });

  it.each(componentSources())('%s declares no dark: variant', (_name, source) => {
    expect(source.match(/\bdark:/g) ?? []).toEqual([]);
  });
});
