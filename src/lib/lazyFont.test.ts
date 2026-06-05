import { describe, it, expect, afterEach, vi } from 'vitest';
import { lazyFont } from './lazyFont';

const orig = globalThis.IntersectionObserver;
const fakeNode = () => ({ style: {} }) as unknown as HTMLElement;

afterEach(() => {
  globalThis.IntersectionObserver = orig;
});

describe('lazyFont attachment', () => {
  it('does not apply the font until the element intersects, then applies it', () => {
    let cb: (entries: { isIntersecting: boolean }[]) => void = () => {};
    globalThis.IntersectionObserver = class {
      constructor(c: any) {
        cb = c;
      }
      observe() {}
      disconnect() {}
    } as any;

    const node = fakeNode();
    lazyFont('Inter')(node);
    expect(node.style.fontFamily).toBeFalsy(); // not on screen yet

    cb([{ isIntersecting: true }]); // scrolled into view
    expect(node.style.fontFamily).toBe("'Inter', sans-serif");
  });

  it('applies immediately when IntersectionObserver is unavailable', () => {
    globalThis.IntersectionObserver = undefined as any;
    const node = fakeNode();
    lazyFont('Roboto Mono')(node);
    expect(node.style.fontFamily).toBe("'Roboto Mono', sans-serif");
  });

  it('re-running with a new family swaps it once visible', () => {
    // The attachment re-runs (teardown + re-attach) when `family` changes; a
    // fresh observer fires intersection and applies the new family.
    let cb: (entries: { isIntersecting: boolean }[]) => void = () => {};
    globalThis.IntersectionObserver = class {
      constructor(c: any) {
        cb = c;
      }
      observe() {}
      disconnect() {}
    } as any;

    const node = fakeNode();
    lazyFont('Lora')(node);
    cb([{ isIntersecting: true }]);
    expect(node.style.fontFamily).toBe("'Lora', sans-serif");

    lazyFont('Bitter')(node);
    cb([{ isIntersecting: true }]);
    expect(node.style.fontFamily).toBe("'Bitter', sans-serif");
  });

  it('disconnects the observer on teardown', () => {
    const disconnect = vi.fn();
    globalThis.IntersectionObserver = class {
      observe() {}
      disconnect() {
        disconnect();
      }
    } as any;
    const node = fakeNode();
    const cleanup = lazyFont('X')(node);
    cleanup?.();
    expect(disconnect).toHaveBeenCalled();
  });
});
