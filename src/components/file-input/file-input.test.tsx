import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileInput } from "./file-input";

const file = (name: string) =>
  new File(["x"], name, { type: "image/png" });

const control = () =>
  document.querySelector<HTMLInputElement>(
    '[data-slot="file-input-control"]',
  )!;

describe("<FileInput />", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<FileInput placeholder="Belum ada file" />);
    expect(screen.getByText("Belum ada file")).toBeInTheDocument();
  });

  it("shows the filename once a file is selected", () => {
    render(<FileInput value={file("odometer.png")} />);
    expect(screen.getByText("odometer.png")).toBeInTheDocument();
    expect(screen.queryByText("Belum ada file dipilih")).toBeNull();
  });

  it("keeps a real file input as the control, so the browser owns the dialog", () => {
    render(<FileInput accept="image/*" capture="environment" />);
    const input = control();
    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("file");
    // Passed through rather than swallowed — capture is what opens the camera
    // directly on mobile, and losing it silently degrades to a file browser.
    expect(input.getAttribute("accept")).toBe("image/*");
    expect(input.getAttribute("capture")).toBe("environment");
  });

  it("stays reachable by keyboard (sr-only must not mean hidden)", async () => {
    render(<FileInput />);
    await userEvent.tab();
    expect(control()).toHaveFocus();
  });

  it("reports the chosen file", async () => {
    const onValueChange = vi.fn();
    render(<FileInput onValueChange={onValueChange} />);
    await userEvent.upload(control(), file("struk.png"));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "struk.png" }),
    );
  });

  it("cancels the clear click so the wrapping label cannot reopen the picker", () => {
    // The root is a <label>, so activating any descendant is forwarded to the
    // control unless the click is cancelled — without that, clearing would pop
    // the file dialog straight back open.
    //
    // Asserting "the control received no click" would be vacuous here: jsdom
    // does not implement label-to-control forwarding at all, so that assertion
    // holds even with preventDefault removed (verified by mutation). The
    // cancellation itself is the thing under test, so assert that.
    const onValueChange = vi.fn();
    render(<FileInput value={file("a.png")} onValueChange={onValueChange} />);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const notCancelled = screen
      .getByRole("button", { name: "Hapus file" })
      .dispatchEvent(event);

    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(event.defaultPrevented).toBe(true);
    expect(notCancelled).toBe(false);
  });

  it("lets the same file be re-picked after clearing", async () => {
    // Browsers fire no change event when the selection is identical to the
    // current DOM value, so clearing has to reset input.value or re-picking
    // the same photo silently does nothing.
    const onValueChange = vi.fn();
    const { rerender } = render(
      <FileInput value={null} onValueChange={onValueChange} />,
    );
    const same = file("odometer.png");

    await userEvent.upload(control(), same);
    rerender(<FileInput value={same} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Hapus file" }));
    expect(control().value).toBe("");

    rerender(<FileInput value={null} onValueChange={onValueChange} />);
    await userEvent.upload(control(), same);

    expect(onValueChange).toHaveBeenCalledTimes(3);
    expect(onValueChange).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ name: "odometer.png" }),
    );
  });

  it("hides the clear button when there is nothing to clear", () => {
    render(<FileInput value={null} />);
    expect(screen.queryByRole("button", { name: "Hapus file" })).toBeNull();
  });

  it("marks the control invalid in the error state", () => {
    render(<FileInput state="error" />);
    expect(control()).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the control and drops the clear button when disabled", () => {
    render(<FileInput value={file("a.png")} disabled />);
    expect(control()).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Hapus file" })).toBeNull();
  });

  it("takes its accessible name from an external label", () => {
    render(
      <>
        <label htmlFor="odo">Foto odometer awal</label>
        <FileInput id="odo" />
      </>,
    );
    expect(
      screen.getByLabelText("Foto odometer awal"),
    ).toBe(control());
  });
});
