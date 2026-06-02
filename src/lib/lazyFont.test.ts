import { describe, it, expect, afterEach, vi } from 'vitest';
import { lazyFont } from './lazyFont';

const orig = globalThis.IntersectionObserver;
const fakeNode = () => ({ style: {} }) as unknown as HTMLElement;

afterEach(() => {
  globalThis.IntersectionObserver = orig;
});

describe('lazyFont action', () => {
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
    lazyFont(node, 'Inter');
    expect(node.style.fontFamily).toBeFalsy(); // not on screen yet

    cb([{ isIntersecting: true }]); // scrolled into view
    expect(node.style.fontFamily).toBe("'Inter', sans-serif");
  });

  it('applies immediately when IntersectionObserver is unavailable', () => {
    globalThis.IntersectionObserver = undefined as any;
    const node = fakeNode();
    lazyFont(node, 'Roboto Mono');
    expect(node.style.fontFamily).toBe("'Roboto Mono', sans-serif");
  });

  it('update() swaps the family once it is already visible', () => {
    let cb: (entries: { isIntersecting: boolean }[]) => void = () => {};
    globalThis.IntersectionObserver = class {
      constructor(c: any) {
        cb = c;
      }
      observe() {}
      disconnect() {}
    } as any;

    const node = fakeNode();
    const handle = lazyFont(node, 'Lora');
    cb([{ isIntersecting: true }]);
    expect(node.style.fontFamily).toBe("'Lora', sans-serif");
    handle.update('Bitter');
    expect(node.style.fontFamily).toBe("'Bitter', sans-serif");
  });

  it('disconnects the observer on destroy', () => {
    const disconnect = vi.fn();
    globalThis.IntersectionObserver = class {
      observe() {}
      disconnect() {
        disconnect();
      }
    } as any;
    const node = fakeNode();
    lazyFont(node, 'X').destroy();
    expect(disconnect).toHaveBeenCalled();
  });
});
