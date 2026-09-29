/**
 * The page's `<title>` and meta description, derived from the profile.
 *
 * These two strings are the last place a name used to be hardcoded. `index.html`
 * is not a component, so the "never a second source of truth" rule in
 * `CLAUDE.md` was easy to read as not applying to it - and the result was a
 * browser tab that still said "Jane Doe" long after the rest of the site was
 * yours.
 *
 * This module is build-time only: `vite.config.ts` imports it and substitutes
 * the tokens in `index.html` while serving and while building. It is never
 * imported by anything under `src/components/`, so none of it reaches the
 * browser bundle. It lives beside the schema because it is derived from the
 * content contract, and it should move when that moves.
 */
import type { Profile } from './schema.ts';

/** The tokens `index.html` carries in place of the real values. */
export const TITLE_TOKEN = '__PAGE_TITLE__';
export const DESCRIPTION_TOKEN = '__PAGE_DESCRIPTION__';
export const SOCIAL_TOKEN = '__SOCIAL_META__';

/** Browser tab, bookmark, search result heading. */
export function pageTitle(profile: Profile): string {
  return `${profile.name} - Portfolio`;
}

/**
 * The grey line under the link in a search result, and the preview when someone
 * pastes the URL into a chat. The headline is already the one sentence about
 * yourself that you chose, so it is the honest thing to put here.
 */
export function pageDescription(profile: Profile): string {
  return profile.headline;
}

/**
 * Escaped because both values are content someone typed. A name with an
 * ampersand in it, or a headline with a quotation mark, would otherwise end up
 * as broken markup in the one file we cannot typecheck.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * The tags a link preview reads: Open Graph for LinkedIn, Slack, iMessage and
 * the rest, plus the two Twitter ones that nothing else covers.
 *
 * `og:image` has to be absolute. A relative path is not resolved by any of
 * these crawlers - it is dropped, and the card renders with no picture at all,
 * which is indistinguishable from having written no tags. So when there is no
 * `siteUrl` to build an absolute URL from, the image tags are left out and the
 * card falls back to `summary`, which is the small text-only layout and is
 * honest about having no image.
 */
export function socialMetaTags(profile: Profile): string {
  const absolute = (path: string) =>
    profile.siteUrl ? new URL(path, profile.siteUrl).href : null;

  const image = profile.socialImage ? absolute(profile.socialImage.src) : null;

  const tags: Array<[string, string]> = [
    ['og:type', 'website'],
    ['og:site_name', profile.name],
    ['og:title', pageTitle(profile)],
    ['og:description', pageDescription(profile)],
    ['twitter:title', pageTitle(profile)],
    ['twitter:description', pageDescription(profile)],
  ];

  const url = absolute('/');
  if (url) tags.push(['og:url', url]);

  if (image && profile.socialImage) {
    tags.push(['og:image', image]);
    tags.push(['og:image:alt', profile.socialImage.alt]);
    tags.push(['twitter:image', image]);
    tags.push(['twitter:card', 'summary_large_image']);
  } else {
    tags.push(['twitter:card', 'summary']);
  }

  // `og:` uses `property`, `twitter:` uses `name`. Crawlers are lenient about
  // it; validators are not.
  return tags
    .map(([key, value]) => {
      const attribute = key.startsWith('og:') ? 'property' : 'name';
      return `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
    })
    .join('\n    ');
}

/** Substitutes every token. Used by the Vite plugin in `vite.config.ts`. */
export function applyPageMetadata(html: string, profile: Profile): string {
  return html
    .replaceAll(TITLE_TOKEN, escapeHtml(pageTitle(profile)))
    .replaceAll(DESCRIPTION_TOKEN, escapeHtml(pageDescription(profile)))
    .replaceAll(SOCIAL_TOKEN, socialMetaTags(profile));
}
