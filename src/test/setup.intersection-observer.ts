// jsdom does not implement IntersectionObserver. Embla constructs one during
// init to track which slides are in view, so without a stub every Carousel
// test throws before a single assertion runs.
//
// The stub deliberately never fires: jsdom has no layout, so any callback it
// invoked would carry made-up intersection ratios. Carousel's own state comes
// from embla's `select`/`reInit` events rather than from slides-in-view, so
// the parts under test — the ARIA wiring and the arrow disabled states — are
// unaffected by the observer staying silent. Anything that genuinely depends
// on visibility belongs in the Storybook project, which runs in real Chromium.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "0px";
    readonly thresholds: ReadonlyArray<number> = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

// Embla also measures the viewport through ResizeObserver on reInit.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}
