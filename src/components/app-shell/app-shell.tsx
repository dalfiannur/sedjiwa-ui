/* eslint-disable react-refresh/only-export-components -- compound component
   intentionally co-locates all sub-components and the `useAppShell` hook in
   one file to share the layout context and displayName constants. Library
   code; HMR semantics don't apply here. */
import * as React from "react";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../sheet";
import { TooltipProvider } from "../tooltip";

const SIDEBAR_COOKIE_NAME = "app_shell_sidebar_state";
const ASIDE_COOKIE_NAME = "app_shell_aside_state";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const DEFAULT_STORAGE_KEY = "app-shell";

/**
 * Thin, auto-hiding scrollbar styling shared by Sidebar, Aside, and Main.
 * Each region clips and scrolls within its own grid cell so the three
 * panels move independently of one another.
 */
const SCROLL_PANEL_CLASSES = [
  "overflow-y-auto overflow-x-hidden overscroll-contain",
  "[scrollbar-width:thin]",
  "[scrollbar-color:var(--color-border)_transparent]",
  "[&::-webkit-scrollbar]:w-1.5",
  "[&::-webkit-scrollbar]:h-1.5",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:bg-border",
  "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
].join(" ");

const ROOT_DISPLAY_NAME = "AppShell.Root";
const HEADER_DISPLAY_NAME = "AppShell.Header";
const SIDEBAR_DISPLAY_NAME = "AppShell.Sidebar";
const ASIDE_DISPLAY_NAME = "AppShell.Aside";
const MAIN_DISPLAY_NAME = "AppShell.Main";
const FOOTER_DISPLAY_NAME = "AppShell.Footer";
const SIDEBAR_TRIGGER_DISPLAY_NAME = "AppShell.SidebarTrigger";
const ASIDE_TRIGGER_DISPLAY_NAME = "AppShell.AsideTrigger";

function getDisplayName(element: React.ReactElement): string | undefined {
  const t = element.type as { displayName?: string; name?: string } | string;
  if (typeof t === "string") return undefined;
  return t?.displayName ?? t?.name;
}

function useBreakpoint(maxWidth: number) {
  const [matches, setMatches] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [maxWidth]);
  return matches;
}

function getRemPx(): number {
  if (typeof window === "undefined" || !document?.documentElement) return 16;
  const v = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(v) && v > 0 ? v : 16;
}

function parseLengthPx(value: string, fallback: number): number {
  const m = /^\s*(-?\d*\.?\d+)\s*(px|rem|em)?\s*$/i.exec(value);
  if (!m || !m[1]) return fallback;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? "px").toLowerCase();
  if (unit === "px") return n;
  if (unit === "rem" || unit === "em") return n * getRemPx();
  return fallback;
}

function readStoredWidth(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeStoredWidth(key: string, value: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(Math.round(value)));
  } catch {
    /* ignore quota / privacy errors */
  }
}

export type AppShellContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  asideOpen: boolean;
  setAsideOpen: (open: boolean) => void;
  toggleAside: () => void;
  isMobile: boolean;
  isTablet: boolean;
  resizable: boolean;
  sidebarWidthPx: number;
  setSidebarWidthPx: (px: number) => void;
  commitSidebarWidth: () => void;
  asideWidthPx: number;
  setAsideWidthPx: (px: number) => void;
  commitAsideWidth: () => void;
  sidebarMinPx: number;
  sidebarMaxPx: number;
  asideMinPx: number;
  asideMaxPx: number;
};

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within an AppShell.Root.");
  }
  return ctx;
}

export type AppShellRootProps = Omit<
  React.ComponentProps<"div">,
  "onChange"
> & {
  headerHeight?: string;
  footerHeight?: string;
  sidebarWidth?: string;
  asideWidth?: string;
  sidebarMinWidth?: string;
  sidebarMaxWidth?: string;
  asideMinWidth?: string;
  asideMaxWidth?: string;
  sidebarBreakpoint?: number;
  asideBreakpoint?: number;
  defaultSidebarOpen?: boolean;
  defaultAsideOpen?: boolean;
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  asideOpen?: boolean;
  onAsideOpenChange?: (open: boolean) => void;
  /** Enable drag-to-resize on Sidebar and Aside. Default `true`. */
  resizable?: boolean;
  /**
   * Prefix for localStorage keys persisting resized widths. Two keys are
   * written: `${storageKey}:sidebar-width` and `${storageKey}:aside-width`.
   * Set distinct values when multiple shells share a domain. Default
   * `"app-shell"`.
   */
  storageKey?: string;
};

function AppShellRoot({
  headerHeight = "60px",
  footerHeight = "48px",
  sidebarWidth = "280px",
  asideWidth = "320px",
  sidebarMinWidth = "200px",
  sidebarMaxWidth = "560px",
  asideMinWidth = "240px",
  asideMaxWidth = "560px",
  sidebarBreakpoint = 768,
  asideBreakpoint = 1024,
  defaultSidebarOpen = true,
  defaultAsideOpen = true,
  sidebarOpen: sidebarOpenProp,
  onSidebarOpenChange,
  asideOpen: asideOpenProp,
  onAsideOpenChange,
  resizable = true,
  storageKey = DEFAULT_STORAGE_KEY,
  className,
  style,
  children,
  ...divProps
}: AppShellRootProps) {
  const isMobile = useBreakpoint(sidebarBreakpoint);
  const isTablet = useBreakpoint(asideBreakpoint);

  const sidebarStorageKey = `${storageKey}:sidebar-width`;
  const asideStorageKey = `${storageKey}:aside-width`;

  const sidebarMinPx = React.useMemo(
    () => parseLengthPx(sidebarMinWidth, 200),
    [sidebarMinWidth],
  );
  const sidebarMaxPx = React.useMemo(
    () => parseLengthPx(sidebarMaxWidth, 560),
    [sidebarMaxWidth],
  );
  const asideMinPx = React.useMemo(
    () => parseLengthPx(asideMinWidth, 240),
    [asideMinWidth],
  );
  const asideMaxPx = React.useMemo(
    () => parseLengthPx(asideMaxWidth, 560),
    [asideMaxWidth],
  );

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const [sidebarWidthPx, setSidebarWidthPxState] = React.useState<number>(
    () => {
      const initial = parseLengthPx(sidebarWidth, 280);
      const stored = resizable ? readStoredWidth(sidebarStorageKey) : null;
      return clamp(stored ?? initial, sidebarMinPx, sidebarMaxPx);
    },
  );
  const setSidebarWidthPx = React.useCallback(
    (px: number) => {
      setSidebarWidthPxState(clamp(px, sidebarMinPx, sidebarMaxPx));
    },
    [sidebarMinPx, sidebarMaxPx],
  );
  const commitSidebarWidth = React.useCallback(() => {
    writeStoredWidth(sidebarStorageKey, sidebarWidthPx);
  }, [sidebarStorageKey, sidebarWidthPx]);

  const [asideWidthPx, setAsideWidthPxState] = React.useState<number>(() => {
    const initial = parseLengthPx(asideWidth, 320);
    const stored = resizable ? readStoredWidth(asideStorageKey) : null;
    return clamp(stored ?? initial, asideMinPx, asideMaxPx);
  });
  const setAsideWidthPx = React.useCallback(
    (px: number) => {
      setAsideWidthPxState(clamp(px, asideMinPx, asideMaxPx));
    },
    [asideMinPx, asideMaxPx],
  );
  const commitAsideWidth = React.useCallback(() => {
    writeStoredWidth(asideStorageKey, asideWidthPx);
  }, [asideStorageKey, asideWidthPx]);

  const [internalSidebarOpen, setInternalSidebarOpen] =
    React.useState(defaultSidebarOpen);
  const sidebarOpen = sidebarOpenProp ?? internalSidebarOpen;
  const setSidebarOpen = React.useCallback(
    (value: boolean) => {
      if (onSidebarOpenChange) {
        onSidebarOpenChange(value);
      } else {
        setInternalSidebarOpen(value);
      }
      if (typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}`;
      }
    },
    [onSidebarOpenChange],
  );
  const toggleSidebar = React.useCallback(
    () => setSidebarOpen(!sidebarOpen),
    [sidebarOpen, setSidebarOpen],
  );

  const [internalAsideOpen, setInternalAsideOpen] =
    React.useState(defaultAsideOpen);
  const asideOpen = asideOpenProp ?? internalAsideOpen;
  const setAsideOpen = React.useCallback(
    (value: boolean) => {
      if (onAsideOpenChange) {
        onAsideOpenChange(value);
      } else {
        setInternalAsideOpen(value);
      }
      if (typeof document !== "undefined") {
        document.cookie = `${ASIDE_COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}`;
      }
    },
    [onAsideOpenChange],
  );
  const toggleAside = React.useCallback(
    () => setAsideOpen(!asideOpen),
    [asideOpen, setAsideOpen],
  );

  const ctx = React.useMemo<AppShellContextValue>(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      asideOpen,
      setAsideOpen,
      toggleAside,
      isMobile,
      isTablet,
      resizable,
      sidebarWidthPx,
      setSidebarWidthPx,
      commitSidebarWidth,
      asideWidthPx,
      setAsideWidthPx,
      commitAsideWidth,
      sidebarMinPx,
      sidebarMaxPx,
      asideMinPx,
      asideMaxPx,
    }),
    [
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      asideOpen,
      setAsideOpen,
      toggleAside,
      isMobile,
      isTablet,
      resizable,
      sidebarWidthPx,
      setSidebarWidthPx,
      commitSidebarWidth,
      asideWidthPx,
      setAsideWidthPx,
      commitAsideWidth,
      sidebarMinPx,
      sidebarMaxPx,
      asideMinPx,
      asideMaxPx,
    ],
  );

  const childArr = React.Children.toArray(children);
  const present = React.useMemo(() => {
    const has = (name: string) =>
      childArr.some(
        (c) => React.isValidElement(c) && getDisplayName(c) === name,
      );
    return {
      header: has(HEADER_DISPLAY_NAME),
      sidebar: has(SIDEBAR_DISPLAY_NAME),
      aside: has(ASIDE_DISPLAY_NAME),
      footer: has(FOOTER_DISPLAY_NAME),
    };
  }, [childArr]);

  const effectiveSidebarWidth =
    present.sidebar && !isMobile ? `${sidebarWidthPx}px` : "0px";
  const effectiveAsideWidth =
    present.aside && !isTablet ? `${asideWidthPx}px` : "0px";
  const effectiveHeaderHeight = present.header ? headerHeight : "0px";
  const effectiveFooterHeight = present.footer ? footerHeight : "0px";

  return (
    <AppShellContext.Provider value={ctx}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="app-shell"
          data-sidebar-state={sidebarOpen ? "expanded" : "collapsed"}
          data-aside-state={asideOpen ? "expanded" : "collapsed"}
          style={
            {
              "--app-shell-header-h": effectiveHeaderHeight,
              "--app-shell-footer-h": effectiveFooterHeight,
              "--app-shell-sidebar-w": effectiveSidebarWidth,
              "--app-shell-aside-w": effectiveAsideWidth,
              gridTemplateAreas:
                '"sidebar header aside" "sidebar main aside" "sidebar footer aside"',
              gridTemplateColumns:
                "var(--app-shell-sidebar-w) 1fr var(--app-shell-aside-w)",
              gridTemplateRows:
                "var(--app-shell-header-h) 1fr var(--app-shell-footer-h)",
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "bg-background text-foreground grid h-svh w-full overflow-hidden",
            className,
          )}
          {...divProps}
        >
          {children}
        </div>
      </TooltipProvider>
    </AppShellContext.Provider>
  );
}
AppShellRoot.displayName = ROOT_DISPLAY_NAME;

export type AppShellHeaderProps = React.ComponentProps<"header"> & {
  sticky?: boolean;
};

function AppShellHeader({
  className,
  sticky = false,
  ...props
}: AppShellHeaderProps) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "bg-background flex items-center border-b [grid-area:header]",
        sticky && "sticky top-0 z-30",
        className,
      )}
      {...props}
    />
  );
}
AppShellHeader.displayName = HEADER_DISPLAY_NAME;

export type AppShellFooterProps = React.ComponentProps<"footer"> & {
  sticky?: boolean;
};

function AppShellFooter({
  className,
  sticky = false,
  ...props
}: AppShellFooterProps) {
  return (
    <footer
      data-slot="app-shell-footer"
      className={cn(
        "bg-background flex items-center border-t [grid-area:footer]",
        sticky && "sticky bottom-0 z-30",
        className,
      )}
      {...props}
    />
  );
}
AppShellFooter.displayName = FOOTER_DISPLAY_NAME;

export type AppShellMainProps = React.ComponentProps<"main">;

function AppShellMain({ className, ...props }: AppShellMainProps) {
  return (
    <main
      data-slot="app-shell-main"
      className={cn(
        "min-h-0 min-w-0 [grid-area:main]",
        SCROLL_PANEL_CLASSES,
        className,
      )}
      {...props}
    />
  );
}
AppShellMain.displayName = MAIN_DISPLAY_NAME;

type ResizeHandleProps = {
  /** Which edge of the parent region the handle sits on. */
  edge: "right" | "left";
  width: number;
  min: number;
  max: number;
  onResize: (next: number) => void;
  onResizeEnd: () => void;
  label: string;
};

function ResizeHandle({
  edge,
  width,
  min,
  max,
  onResize,
  onResizeEnd,
  label,
}: ResizeHandleProps) {
  const draggingRef = React.useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (typeof document !== "undefined") {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    // Sidebar lives at viewport left; its handle's right edge tracks clientX.
    // Aside lives at viewport right; its handle's left edge tracks (innerWidth - clientX).
    const raw =
      edge === "right"
        ? e.clientX
        : (typeof window !== "undefined" ? window.innerWidth : 0) - e.clientX;
    onResize(raw);
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (typeof document !== "undefined") {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    onResizeEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 50 : 10;
    let next: number | null = null;
    if (e.key === "ArrowLeft") {
      next = edge === "right" ? width - step : width + step;
    } else if (e.key === "ArrowRight") {
      next = edge === "right" ? width + step : width - step;
    } else if (e.key === "Home") {
      next = min;
    } else if (e.key === "End") {
      next = max;
    }
    if (next !== null) {
      e.preventDefault();
      onResize(next);
      onResizeEnd();
    }
  };

  return (
    <button
      type="button"
      data-slot="app-shell-resize-handle"
      data-edge={edge}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(width)}
      aria-valuemin={Math.round(min)}
      aria-valuemax={Math.round(max)}
      aria-label={label}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => {
        draggingRef.current = false;
        if (typeof document !== "undefined") {
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        }
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute top-0 z-20 h-full w-1.5 cursor-col-resize touch-none select-none",
        "bg-transparent transition-colors",
        "hover:bg-border focus-visible:bg-ring focus-visible:outline-none",
        edge === "right" ? "-right-[3px]" : "-left-[3px]",
      )}
    />
  );
}

export type AppShellSidebarProps = React.ComponentProps<"aside"> & {
  /**
   * Sheet width when collapsed on mobile. Accepts any CSS length string.
   * Defaults to `"18rem"`, mirroring the Sidebar component.
   */
  mobileWidth?: string;
};

function AppShellSidebar({
  className,
  children,
  mobileWidth = "18rem",
  ...props
}: AppShellSidebarProps) {
  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    resizable,
    sidebarWidthPx,
    setSidebarWidthPx,
    commitSidebarWidth,
    sidebarMinPx,
    sidebarMaxPx,
  } = useAppShell();

  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          data-slot="app-shell-sidebar"
          data-mobile="true"
          side="left"
          className="p-0"
          style={{ width: mobileWidth, maxWidth: mobileWidth }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Application navigation.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-slot="app-shell-sidebar"
      className={cn(
        "bg-background relative flex flex-col border-r [grid-area:sidebar]",
        className,
      )}
      {...props}
    >
      <div
        data-slot="app-shell-sidebar-scroll"
        className={cn("flex flex-1 flex-col", SCROLL_PANEL_CLASSES)}
      >
        {children}
      </div>
      {resizable && (
        <ResizeHandle
          edge="right"
          width={sidebarWidthPx}
          min={sidebarMinPx}
          max={sidebarMaxPx}
          onResize={setSidebarWidthPx}
          onResizeEnd={commitSidebarWidth}
          label="Resize sidebar"
        />
      )}
    </aside>
  );
}
AppShellSidebar.displayName = SIDEBAR_DISPLAY_NAME;

export type AppShellAsideProps = React.ComponentProps<"aside"> & {
  mobileWidth?: string;
};

function AppShellAside({
  className,
  children,
  mobileWidth = "20rem",
  ...props
}: AppShellAsideProps) {
  const {
    isTablet,
    asideOpen,
    setAsideOpen,
    resizable,
    asideWidthPx,
    setAsideWidthPx,
    commitAsideWidth,
    asideMinPx,
    asideMaxPx,
  } = useAppShell();

  if (isTablet) {
    return (
      <Sheet open={asideOpen} onOpenChange={setAsideOpen}>
        <SheetContent
          data-slot="app-shell-aside"
          data-mobile="true"
          side="right"
          className="p-0"
          style={{ width: mobileWidth, maxWidth: mobileWidth }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Aside</SheetTitle>
            <SheetDescription>Contextual details panel.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-slot="app-shell-aside"
      className={cn(
        "bg-background relative flex flex-col border-l [grid-area:aside]",
        className,
      )}
      {...props}
    >
      <div
        data-slot="app-shell-aside-scroll"
        className={cn("flex flex-1 flex-col", SCROLL_PANEL_CLASSES)}
      >
        {children}
      </div>
      {resizable && (
        <ResizeHandle
          edge="left"
          width={asideWidthPx}
          min={asideMinPx}
          max={asideMaxPx}
          onResize={setAsideWidthPx}
          onResizeEnd={commitAsideWidth}
          label="Resize aside"
        />
      )}
    </aside>
  );
}
AppShellAside.displayName = ASIDE_DISPLAY_NAME;

export type AppShellSidebarTriggerProps = React.ComponentProps<typeof Button>;

function AppShellSidebarTrigger({
  className,
  onClick,
  children,
  ...props
}: AppShellSidebarTriggerProps) {
  const { toggleSidebar } = useAppShell();
  return (
    <Button
      data-slot="app-shell-sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {children ?? (
        <>
          <PanelLeftIcon />
          <span className="sr-only">Toggle sidebar</span>
        </>
      )}
    </Button>
  );
}
AppShellSidebarTrigger.displayName = SIDEBAR_TRIGGER_DISPLAY_NAME;

export type AppShellAsideTriggerProps = React.ComponentProps<typeof Button>;

function AppShellAsideTrigger({
  className,
  onClick,
  children,
  ...props
}: AppShellAsideTriggerProps) {
  const { toggleAside } = useAppShell();
  return (
    <Button
      data-slot="app-shell-aside-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleAside();
      }}
      {...props}
    >
      {children ?? (
        <>
          <PanelRightIcon />
          <span className="sr-only">Toggle aside</span>
        </>
      )}
    </Button>
  );
}
AppShellAsideTrigger.displayName = ASIDE_TRIGGER_DISPLAY_NAME;

export {
  AppShellRoot,
  AppShellHeader,
  AppShellSidebar,
  AppShellAside,
  AppShellMain,
  AppShellFooter,
  AppShellSidebarTrigger,
  AppShellAsideTrigger,
};

export const AppShell = {
  Root: AppShellRoot,
  Header: AppShellHeader,
  Sidebar: AppShellSidebar,
  Aside: AppShellAside,
  Main: AppShellMain,
  Footer: AppShellFooter,
  SidebarTrigger: AppShellSidebarTrigger,
  AsideTrigger: AppShellAsideTrigger,
};
