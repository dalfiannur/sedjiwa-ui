import * as React from "react";
import type {
  EmblaViewportRefType,
  UseEmblaCarouselType,
} from "embla-carousel-react";

/** embla-carousel-react re-exports only the hook's own tuple type; the core
 *  types live in `embla-carousel`, which is its dependency and not ours. So
 *  the API type is derived from the tuple rather than imported, which keeps
 *  the peer surface to the one package consumers actually install. */
export type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

export type CarouselOrientation = "horizontal" | "vertical";

export type CarouselContextValue = {
  /** Attach to the viewport element embla measures. */
  viewportRef: EmblaViewportRefType;
  api: EmblaApi | undefined;
  orientation: CarouselOrientation;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  /** 0-based index of the slide currently snapped. */
  selectedIndex: number;
  slideCount: number;
};

export const CarouselContext = React.createContext<CarouselContextValue | null>(null);

export function useCarousel(component: string): CarouselContextValue {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) {
    throw new Error(`Carousel.${component} must be rendered inside <Carousel>`);
  }
  return ctx;
}
