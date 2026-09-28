import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { afterEach, expect } from 'vitest';

expect.extend(toHaveNoViolations);

/*
 * jsdom implements <dialog> as an element but not its behaviour: showModal()
 * throws "not implemented". The image dialog calls it directly, so without
 * this every test that opens one fails on the environment rather than on the
 * code.
 *
 * This stands in for the open/closed bookkeeping only. It is deliberately NOT
 * a modal: focus trapping, inertness, backdrop rendering and Escape-to-close
 * are the browser's, and a fake that pretended to provide them would let a
 * real regression pass. Those were verified in a real browser instead - see
 * docs/adr/ADR-015-entry-images.md.
 */
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

afterEach(() => {
  cleanup();
});
