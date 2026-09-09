import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button";
import {
  CarouselContext,
  useCarousel,
  type CarouselContextValue,
  type CarouselOrientation,
  type EmblaApi,
} from "./carousel.context";

type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;
type EmblaPlugins = NonNullable<Parameters<typeof useEmblaCarousel>[1]>;

export type CarouselProps = React.ComponentProps<"section"> & {
  orientation?: CarouselOrientation;
  opts?: EmblaOptions;
  plugins?: EmblaPlugins;
  /** Hands the embla instance back so a caller can drive it (autoplay, a
   *  thumbnail strip, analytics on slide change). */
  setApi?: (api: EmblaApi) => void;
  /** Names the region. Required in practice: without it a screen reader
   *  announces an unlabelled carousel and the user has no idea what it holds. */
  "aria-label": string;
};

export function Carousel({
  className,
  orientation = "horizontal",
  opts,
  plugins,
  setApi,
  children,
  onKeyDown,
  ...props
}: CarouselProps) {
  const [viewportRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins,
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const sync = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
      setSlideCount(api.scrollSnapList().length);
    };

    sync();
    // `reInit` matters as much as `select`: slides added or removed after mount
    // change both the count and whether the arrows should be live, and embla
    // does not fire `select` for that.
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  React.useEffect(() => {
    if (api && setApi) setApi(api);
  }, [api, setApi]);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const value = React.useMemo<CarouselContextValue>(
    () => ({
      viewportRef,
      api,
      orientation,
      canScrollPrev,
      canScrollNext,
      scrollPrev,
      scrollNext,
      selectedIndex,
      slideCount,
    }),
    [
      viewportRef, api, orientation, canScrollPrev, canScrollNext,
      scrollPrev, scrollNext, selectedIndex, slideCount,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    if (e.key === prevKey) {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === nextKey) {
      e.preventDefault();
      scrollNext();
    }
  };

  return (
    <CarouselContext.Provider value={value}>
      <section
        data-slot="carousel"
        data-orientation={orientation}
        // region + roledescription is what makes assistive tech announce this
        // as a carousel rather than as a stack of anonymous divs.
        role="region"
        aria-roledescription="carousel"
        className={cn("relative", className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

export type CarouselContentProps = React.ComponentProps<"div"> & {
  /** Class for the inner track, where the gap between slides lives. */
  trackClassName?: string;
};

export function CarouselContent({
  className,
  trackClassName,
  ...props
}: CarouselContentProps) {
  const { viewportRef, orientation } = useCarousel("Content");
  return (
    <div ref={viewportRef} data-slot="carousel-viewport" className="overflow-hidden">
      <div
        data-slot="carousel-content"
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          trackClassName,
          className,
        )}
        {...props}
      />
    </div>
  );
}

export type CarouselItemProps = React.ComponentProps<"div">;

export function CarouselItem({ className, ...props }: CarouselItemProps) {
  const { orientation } = useCarousel("Item");
  return (
    <div
      data-slot="carousel-item"
      // Each slide is a group so its position can be announced; the label is
      // supplied by the caller or falls back to nothing rather than to a wrong
      // index, since CarouselItem cannot know its own position.
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

type CarouselNavProps = Omit<ButtonProps, "children"> & {
  /** Accessible name. Defaults are Indonesian to match the rest of the
   *  library's user-facing strings. */
  label?: string;
};

export function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  label = "Sebelumnya",
  ...props
}: CarouselNavProps) {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel("Previous");
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      aria-label={label}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn("rounded-full", className)}
      {...props}
    >
      <ChevronLeftIcon
        aria-hidden="true"
        className={orientation === "vertical" ? "rotate-90" : undefined}
      />
    </Button>
  );
}

export function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  label = "Berikutnya",
  ...props
}: CarouselNavProps) {
  const { scrollNext, canScrollNext, orientation } = useCarousel("Next");
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      aria-label={label}
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn("rounded-full", className)}
      {...props}
    >
      <ChevronRightIcon
        aria-hidden="true"
        className={orientation === "vertical" ? "rotate-90" : undefined}
      />
    </Button>
  );
}

export type CarouselStatusProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Wording for the announcement and the visible text. */
  format?: (current: number, total: number) => string;
  /** Keep the text off screen but still announced. */
  visuallyHidden?: boolean;
};

/** A live region naming the current slide. Without one, arrow clicks are
 *  silent to a screen reader — the slide changes and nothing is announced. */
export function CarouselStatus({
  className,
  format = (current, total) => `Slide ${current} dari ${total}`,
  visuallyHidden = true,
  ...props
}: CarouselStatusProps) {
  const { selectedIndex, slideCount } = useCarousel("Status");
  return (
    <div
      data-slot="carousel-status"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        visuallyHidden ? "sr-only" : "text-muted-foreground text-sm tabular-nums",
        className,
      )}
      {...props}
    >
      {slideCount > 0 ? format(selectedIndex + 1, slideCount) : ""}
    </div>
  );
}
