import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./copy-button";

const originalClipboard = Object.getOwnPropertyDescriptor(
  globalThis.navigator,
  "clipboard",
);

function installClipboard(writeText: () => Promise<void>): void {
  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

/** No clipboard at all — an insecure context, or an old browser. */
function removeClipboard(): void {
  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: undefined,
  });
}

beforeEach(() => {
  installClipboard(vi.fn().mockResolvedValue(undefined));
});

afterEach(() => {
  vi.useRealTimers();
  if (originalClipboard) {
    Object.defineProperty(globalThis.navigator, "clipboard", originalClipboard);
  }
});

function button(): HTMLButtonElement {
  return screen.getByRole("button") as HTMLButtonElement;
}

describe("<CopyButton />", () => {
  describe("copying", () => {
    it("writes the value to the clipboard", async () => {
      const user = userEvent.setup();
      const writeText = vi.fn().mockResolvedValue(undefined);
      installClipboard(writeText);
      render(<CopyButton value="INV-2026-0042" />);
      await user.click(button());
      expect(writeText).toHaveBeenCalledWith("INV-2026-0042");
    });

    it("reports the copy through onCopy", async () => {
      const user = userEvent.setup();
      const onCopy = vi.fn();
      render(<CopyButton value="abc" onCopy={onCopy} />);
      await user.click(button());
      await waitFor(() => expect(onCopy).toHaveBeenCalledWith("abc"));
    });
  });

  describe("feedback", () => {
    it("starts out offering to copy", () => {
      render(<CopyButton value="abc" />);
      expect(button()).toHaveAttribute("data-copied", "false");
    });

    it("switches to copied once the write resolves", async () => {
      const user = userEvent.setup();
      render(<CopyButton value="abc" />);
      await user.click(button());
      await waitFor(() =>
        expect(button()).toHaveAttribute("data-copied", "true"),
      );
    });

    it("renames itself so the change is not colour-only", async () => {
      const user = userEvent.setup();
      render(<CopyButton value="abc" />);
      expect(button()).toHaveAccessibleName("Salin");
      await user.click(button());
      await waitFor(() =>
        expect(button()).toHaveAccessibleName("Tersalin"),
      );
    });

    it("announces the copy in a live region", async () => {
      const user = userEvent.setup();
      const { container } = render(<CopyButton value="abc" />);
      await user.click(button());
      await waitFor(() => {
        const live = container.querySelector('[aria-live="polite"]');
        expect(live).toHaveTextContent("Tersalin");
      });
    });

    it("goes back to idle after the timeout", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime.bind(vi),
      });
      render(<CopyButton value="abc" timeout={1000} />);
      await user.click(button());
      await vi.waitFor(() =>
        expect(button()).toHaveAttribute("data-copied", "true"),
      );
      // The reset comes from a timer, so React needs the flush wrapped.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });
      expect(button()).toHaveAttribute("data-copied", "false");
    });

    it("takes custom labels", async () => {
      const user = userEvent.setup();
      render(
        <CopyButton value="abc" copyLabel="Copy" copiedLabel="Copied!" />,
      );
      expect(button()).toHaveAccessibleName("Copy");
      await user.click(button());
      await waitFor(() => expect(button()).toHaveAccessibleName("Copied!"));
    });
  });

  describe("failure", () => {
    // Showing the tick when nothing reached the clipboard is worse than
    // showing nothing: the user walks away believing they have the value.
    it("stays idle when the clipboard rejects", async () => {
      const user = userEvent.setup();
      installClipboard(vi.fn().mockRejectedValue(new Error("denied")));
      render(<CopyButton value="abc" />);
      await user.click(button());
      await waitFor(() =>
        expect(button()).toHaveAttribute("data-copied", "false"),
      );
    });

    it("reports the failure through onError", async () => {
      const user = userEvent.setup();
      const onError = vi.fn();
      installClipboard(vi.fn().mockRejectedValue(new Error("denied")));
      render(<CopyButton value="abc" onError={onError} />);
      await user.click(button());
      await waitFor(() => expect(onError).toHaveBeenCalled());
    });

    it("does not fire onCopy when the write fails", async () => {
      const user = userEvent.setup();
      const onCopy = vi.fn();
      installClipboard(vi.fn().mockRejectedValue(new Error("denied")));
      render(<CopyButton value="abc" onCopy={onCopy} />);
      await user.click(button());
      await waitFor(() => expect(onCopy).not.toHaveBeenCalled());
    });

    it("survives a browser with no clipboard API", async () => {
      const user = userEvent.setup();
      const onError = vi.fn();
      removeClipboard();
      render(<CopyButton value="abc" onError={onError} />);
      await user.click(button());
      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(button()).toHaveAttribute("data-copied", "false");
    });
  });

  describe("shape", () => {
    it("is a button, not a submit", () => {
      render(<CopyButton value="abc" />);
      expect(button()).toHaveAttribute("type", "button");
    });

    it("shows a text label when asked", () => {
      render(<CopyButton value="abc" withLabel />);
      expect(button()).toHaveTextContent("Salin");
    });

    it("can be disabled", () => {
      render(<CopyButton value="abc" disabled />);
      expect(button()).toBeDisabled();
    });

    it("does not copy while disabled", async () => {
      const user = userEvent.setup();
      const writeText = vi.fn().mockResolvedValue(undefined);
      installClipboard(writeText);
      render(<CopyButton value="abc" disabled />);
      await user.click(button());
      expect(writeText).not.toHaveBeenCalled();
    });
  });
});
