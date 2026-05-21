import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell, useAppShell } from "./app-shell";

type MqlListener = (event: { matches: boolean }) => void;

function mockMatchMedia(matches: (query: string) => boolean) {
  const listeners = new Set<MqlListener>();
  const make = (query: string) => {
    const mql = {
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener: (_: string, fn: MqlListener) => listeners.add(fn),
      removeEventListener: (_: string, fn: MqlListener) => listeners.delete(fn),
      addListener: (fn: MqlListener) => listeners.add(fn),
      removeListener: (fn: MqlListener) => listeners.delete(fn),
      dispatchEvent: () => true,
    };
    return mql;
  };
  vi.stubGlobal("matchMedia", make);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: make,
  });
}

beforeEach(() => {
  // Desktop by default: nothing matches max-width queries below 1024.
  mockMatchMedia(() => false);
  document.cookie = "app_shell_sidebar_state=; max-age=0; path=/";
  document.cookie = "app_shell_aside_state=; max-age=0; path=/";
  window.localStorage.clear();
  // window.innerWidth defaults to 1024 in jsdom; explicitly pin for
  // aside-edge math (innerWidth - clientX) in resize tests.
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1280,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function firePointerDrag(
  el: Element,
  { from, to }: { from: number; to: number },
) {
  // jsdom does not implement pointer capture; stub the methods that the
  // handler calls on the target so they no-op rather than throw.
  const target = el as HTMLElement & {
    setPointerCapture?: (id: number) => void;
    releasePointerCapture?: (id: number) => void;
    hasPointerCapture?: (id: number) => boolean;
  };
  let captured = false;
  target.setPointerCapture = () => {
    captured = true;
  };
  target.releasePointerCapture = () => {
    captured = false;
  };
  target.hasPointerCapture = () => captured;
  fireEvent.pointerDown(el, { clientX: from, pointerId: 1 });
  fireEvent.pointerMove(el, { clientX: to, pointerId: 1 });
  fireEvent.pointerUp(el, { clientX: to, pointerId: 1 });
}

describe("<AppShell />", () => {
  it("renders all slots with the expected data-slot attributes", () => {
    const { container } = render(
      <AppShell.Root>
        <AppShell.Header>header</AppShell.Header>
        <AppShell.Sidebar>sidebar</AppShell.Sidebar>
        <AppShell.Main>main</AppShell.Main>
        <AppShell.Aside>aside</AppShell.Aside>
        <AppShell.Footer>footer</AppShell.Footer>
      </AppShell.Root>,
    );

    expect(container.querySelector('[data-slot="app-shell"]')).not.toBeNull();
    expect(
      container.querySelector('[data-slot="app-shell-header"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="app-shell-sidebar"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="app-shell-main"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="app-shell-aside"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="app-shell-footer"]'),
    ).not.toBeNull();
  });

  it("uses semantic elements for each region", () => {
    render(
      <AppShell.Root>
        <AppShell.Header>h</AppShell.Header>
        <AppShell.Sidebar>s</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
        <AppShell.Footer>f</AppShell.Footer>
      </AppShell.Root>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument(); // <header>
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // <footer>
    expect(screen.getByRole("complementary")).toBeInTheDocument(); // <aside>
  });

  it("propagates size props as CSS custom properties on the root", () => {
    const { container } = render(
      <AppShell.Root
        headerHeight="80px"
        sidebarWidth="240px"
        asideWidth="360px"
        footerHeight="56px"
      >
        <AppShell.Header>h</AppShell.Header>
        <AppShell.Sidebar>s</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
        <AppShell.Aside>a</AppShell.Aside>
        <AppShell.Footer>f</AppShell.Footer>
      </AppShell.Root>,
    );

    const root = container.querySelector(
      '[data-slot="app-shell"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--app-shell-header-h")).toBe("80px");
    expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe("240px");
    expect(root.style.getPropertyValue("--app-shell-aside-w")).toBe("360px");
    expect(root.style.getPropertyValue("--app-shell-footer-h")).toBe("56px");
  });

  it("collapses CSS vars to 0px for regions the user did not render", () => {
    const { container } = render(
      <AppShell.Root>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );
    const root = container.querySelector(
      '[data-slot="app-shell"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--app-shell-header-h")).toBe("0px");
    expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe("0px");
    expect(root.style.getPropertyValue("--app-shell-aside-w")).toBe("0px");
    expect(root.style.getPropertyValue("--app-shell-footer-h")).toBe("0px");
  });

  it("adds sticky classes when sticky prop is set on Header and Footer", () => {
    render(
      <AppShell.Root>
        <AppShell.Header sticky>h</AppShell.Header>
        <AppShell.Main>m</AppShell.Main>
        <AppShell.Footer sticky>f</AppShell.Footer>
      </AppShell.Root>,
    );
    expect(screen.getByRole("banner")).toHaveClass("sticky", "top-0");
    expect(screen.getByRole("contentinfo")).toHaveClass("sticky", "bottom-0");
  });

  it("does not add sticky classes by default", () => {
    render(
      <AppShell.Root>
        <AppShell.Header>h</AppShell.Header>
        <AppShell.Footer>f</AppShell.Footer>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );
    expect(screen.getByRole("banner")).not.toHaveClass("sticky");
    expect(screen.getByRole("contentinfo")).not.toHaveClass("sticky");
  });

  it("SidebarTrigger toggles sidebar state via context", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AppShell.Root defaultSidebarOpen={false} onSidebarOpenChange={onChange}>
        <AppShell.Header>
          <AppShell.SidebarTrigger />
        </AppShell.Header>
        <AppShell.Sidebar>s</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );

    await user.click(
      screen.getByRole("button", { name: /toggle sidebar/i }),
    );
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AsideTrigger toggles aside state via context", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AppShell.Root defaultAsideOpen={false} onAsideOpenChange={onChange}>
        <AppShell.Header>
          <AppShell.AsideTrigger />
        </AppShell.Header>
        <AppShell.Aside>a</AppShell.Aside>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );

    await user.click(screen.getByRole("button", { name: /toggle aside/i }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("respects controlled sidebarOpen prop and does not mutate internal state", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <AppShell.Root sidebarOpen={false} onSidebarOpenChange={onChange}>
        <AppShell.Header>
          <AppShell.SidebarTrigger />
        </AppShell.Header>
        <AppShell.Sidebar>s</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );

    const root = document.querySelector(
      '[data-slot="app-shell"]',
    ) as HTMLElement;
    expect(root.getAttribute("data-sidebar-state")).toBe("collapsed");

    await user.click(
      screen.getByRole("button", { name: /toggle sidebar/i }),
    );
    expect(onChange).toHaveBeenCalledWith(true);
    // Parent did not update prop; state remains collapsed.
    expect(root.getAttribute("data-sidebar-state")).toBe("collapsed");

    rerender(
      <AppShell.Root sidebarOpen={true} onSidebarOpenChange={onChange}>
        <AppShell.Header>
          <AppShell.SidebarTrigger />
        </AppShell.Header>
        <AppShell.Sidebar>s</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );
    expect(
      document
        .querySelector('[data-slot="app-shell"]')!
        .getAttribute("data-sidebar-state"),
    ).toBe("expanded");
  });

  it("persists sidebar state to a cookie on toggle", async () => {
    const user = userEvent.setup();
    render(
      <AppShell.Root defaultSidebarOpen={false}>
        <AppShell.Header>
          <AppShell.SidebarTrigger />
        </AppShell.Header>
        <AppShell.Sidebar>s</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );

    await user.click(
      screen.getByRole("button", { name: /toggle sidebar/i }),
    );
    expect(document.cookie).toContain("app_shell_sidebar_state=true");
  });

  it("renders sidebar inside a Sheet when below the sidebar breakpoint", () => {
    // Simulate mobile: max-width: 767px matches.
    mockMatchMedia((q) => /max-width:\s*767px/.test(q));

    render(
      <AppShell.Root defaultSidebarOpen={true}>
        <AppShell.Header>h</AppShell.Header>
        <AppShell.Sidebar>mobile-sidebar-content</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );

    // Radix Dialog renders content with role="dialog".
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("mobile-sidebar-content")).toBeInTheDocument();
  });

  it("zeroes the sidebar CSS var when below the sidebar breakpoint", () => {
    mockMatchMedia((q) => /max-width:\s*767px/.test(q));

    const { container } = render(
      <AppShell.Root>
        <AppShell.Header>h</AppShell.Header>
        <AppShell.Sidebar>s</AppShell.Sidebar>
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );
    const root = container.querySelector(
      '[data-slot="app-shell"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe("0px");
  });

  it("merges consumer className on Root", () => {
    const { container } = render(
      <AppShell.Root className="custom-shell">
        <AppShell.Main>m</AppShell.Main>
      </AppShell.Root>,
    );
    expect(container.querySelector('[data-slot="app-shell"]')).toHaveClass(
      "custom-shell",
    );
  });

  describe("useAppShell", () => {
    it("throws when used outside an AppShell.Root", () => {
      // renderHook surfaces the throw without polluting console.
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => renderHook(() => useAppShell())).toThrow(
        /within an AppShell\.Root/,
      );
      spy.mockRestore();
    });
  });

  describe("resize", () => {
    it("renders a resize handle inside Sidebar and Aside on desktop", () => {
      const { container } = render(
        <AppShell.Root>
          <AppShell.Sidebar>s</AppShell.Sidebar>
          <AppShell.Aside>a</AppShell.Aside>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      const handles = container.querySelectorAll(
        '[data-slot="app-shell-resize-handle"]',
      );
      expect(handles.length).toBe(2);
      expect(handles[0]).toHaveAttribute("data-edge", "right");
      expect(handles[1]).toHaveAttribute("data-edge", "left");
    });

    it("omits the resize handles when resizable={false}", () => {
      const { container } = render(
        <AppShell.Root resizable={false}>
          <AppShell.Sidebar>s</AppShell.Sidebar>
          <AppShell.Aside>a</AppShell.Aside>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      expect(
        container.querySelectorAll('[data-slot="app-shell-resize-handle"]'),
      ).toHaveLength(0);
    });

    it("drag updates the sidebar width and persists it on release", () => {
      const { container } = render(
        <AppShell.Root sidebarWidth="280px">
          <AppShell.Sidebar>s</AppShell.Sidebar>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      const handle = container.querySelector(
        '[data-slot="app-shell-resize-handle"][data-edge="right"]',
      )!;
      firePointerDrag(handle, { from: 280, to: 360 });

      const root = container.querySelector(
        '[data-slot="app-shell"]',
      ) as HTMLElement;
      expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe(
        "360px",
      );
      expect(window.localStorage.getItem("app-shell:sidebar-width")).toBe(
        "360",
      );
    });

    it("drag updates the aside width using viewport-right math", () => {
      const { container } = render(
        <AppShell.Root asideWidth="320px">
          <AppShell.Aside>a</AppShell.Aside>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      const handle = container.querySelector(
        '[data-slot="app-shell-resize-handle"][data-edge="left"]',
      )!;
      // innerWidth=1280, drag handle from x=960 (320 from right) to x=880 (400 from right).
      firePointerDrag(handle, { from: 960, to: 880 });

      const root = container.querySelector(
        '[data-slot="app-shell"]',
      ) as HTMLElement;
      expect(root.style.getPropertyValue("--app-shell-aside-w")).toBe("400px");
      expect(window.localStorage.getItem("app-shell:aside-width")).toBe("400");
    });

    it("clamps the resized width to the configured min/max", () => {
      const { container } = render(
        <AppShell.Root
          sidebarWidth="280px"
          sidebarMinWidth="220px"
          sidebarMaxWidth="400px"
        >
          <AppShell.Sidebar>s</AppShell.Sidebar>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      const handle = container.querySelector(
        '[data-slot="app-shell-resize-handle"][data-edge="right"]',
      )!;
      firePointerDrag(handle, { from: 280, to: 50 });
      let root = container.querySelector(
        '[data-slot="app-shell"]',
      ) as HTMLElement;
      expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe(
        "220px",
      );

      firePointerDrag(handle, { from: 220, to: 9999 });
      root = container.querySelector(
        '[data-slot="app-shell"]',
      ) as HTMLElement;
      expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe(
        "400px",
      );
    });

    it("seeds the initial width from localStorage when available", () => {
      window.localStorage.setItem("app-shell:sidebar-width", "312");
      const { container } = render(
        <AppShell.Root sidebarWidth="280px">
          <AppShell.Sidebar>s</AppShell.Sidebar>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      const root = container.querySelector(
        '[data-slot="app-shell"]',
      ) as HTMLElement;
      expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe(
        "312px",
      );
    });

    it("scopes localStorage keys by storageKey", () => {
      window.localStorage.setItem("my-app:sidebar-width", "248");
      const { container } = render(
        <AppShell.Root sidebarWidth="280px" storageKey="my-app">
          <AppShell.Sidebar>s</AppShell.Sidebar>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      const root = container.querySelector(
        '[data-slot="app-shell"]',
      ) as HTMLElement;
      expect(root.style.getPropertyValue("--app-shell-sidebar-w")).toBe(
        "248px",
      );
    });

    it("the resize handle exposes valid separator ARIA", () => {
      const { container } = render(
        <AppShell.Root sidebarWidth="280px">
          <AppShell.Sidebar>s</AppShell.Sidebar>
          <AppShell.Main>m</AppShell.Main>
        </AppShell.Root>,
      );
      const handle = container.querySelector(
        '[data-slot="app-shell-resize-handle"][data-edge="right"]',
      )!;
      expect(handle).toHaveAttribute("role", "separator");
      expect(handle).toHaveAttribute("aria-orientation", "vertical");
      expect(handle).toHaveAttribute("aria-valuenow", "280");
      expect(handle).toHaveAttribute("aria-valuemin", "200");
      expect(handle).toHaveAttribute("aria-valuemax", "560");
      expect(handle).toHaveAttribute("aria-label", "Resize sidebar");
    });
  });
});
