import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageInput } from "./image-input";
import { liveObjectUrls } from "../../test/setup.object-url";

function imageFile(name = "foto.png") {
  return new File(["x"], name, { type: "image/png" });
}

function control() {
  return document.querySelector<HTMLInputElement>(
    '[data-slot="image-input-control"]'
  )!;
}

function preview() {
  return document.querySelector<HTMLImageElement>(
    '[data-slot="image-input-preview"]'
  );
}

describe("<ImageInput />", () => {
  it("names itself with the caption while empty", () => {
    render(<ImageInput label="Unggah foto" />);
    expect(screen.getByLabelText("Unggah foto")).toBe(control());
  });

  it("accepts images by default", () => {
    render(<ImageInput />);
    expect(control()).toHaveAttribute("accept", "image/*");
  });

  it("shows the placeholder when there is nothing to preview", () => {
    render(<ImageInput />);
    expect(preview()).toBeNull();
  });

  it("reports the file the user picked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ImageInput onValueChange={onValueChange} />);

    await user.upload(control(), imageFile());

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![0]).toBeInstanceOf(File);
  });

  it("previews a stored picture from src", () => {
    render(<ImageInput src="https://example.test/moni.png" />);
    expect(preview()).toHaveAttribute("src", "https://example.test/moni.png");
  });

  it("lets the picked file win over the stored one", () => {
    render(<ImageInput src="https://example.test/moni.png" value={imageFile()} />);
    // The object URL, not the server's — someone who just picked a file must
    // be looking at what they picked.
    expect(preview()!.getAttribute("src")).toMatch(/^blob:/);
  });

  it("switches the caption once there is a picture", () => {
    const { rerender } = render(
      <ImageInput label="Unggah foto" replaceLabel="Ganti foto" />
    );
    expect(screen.getByLabelText("Unggah foto")).toBeInTheDocument();

    rerender(
      <ImageInput
        label="Unggah foto"
        replaceLabel="Ganti foto"
        value={imageFile()}
      />
    );
    expect(screen.getByLabelText("Ganti foto")).toBeInTheDocument();
  });

  it("falls back to the placeholder for a file that is not an image", () => {
    // `accept` filters the dialog, not a drop — a PDF here would otherwise
    // render as a broken-image glyph.
    const pdf = new File(["x"], "berkas.pdf", { type: "application/pdf" });
    render(<ImageInput value={pdf} />);
    expect(preview()).toBeNull();
  });

  it("marks the control invalid in the error state", () => {
    render(<ImageInput state="error" />);
    expect(control()).toHaveAttribute("aria-invalid", "true");
  });

  it("derives the error state from aria-invalid", () => {
    render(<ImageInput aria-invalid />);
    expect(
      document.querySelector('[data-slot="image-input"]')
    ).toHaveAttribute("data-state", "error");
  });

  describe("removing", () => {
    it("offers no remove button while empty", () => {
      render(<ImageInput />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("offers one for a picked file", () => {
      render(<ImageInput value={imageFile()} removeLabel="Hapus foto" />);
      expect(
        screen.getByRole("button", { name: "Hapus foto" })
      ).toBeInTheDocument();
    });

    it("stays hidden for a stored picture the caller cannot remove", () => {
      // Clearing `value` would remove nothing the viewer can see, so offering
      // the button would be a lie.
      render(<ImageInput src="https://example.test/moni.png" />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("appears for a stored picture once onRemove is given", () => {
      render(
        <ImageInput
          src="https://example.test/moni.png"
          onRemove={vi.fn()}
          removeLabel="Hapus foto"
        />
      );
      expect(
        screen.getByRole("button", { name: "Hapus foto" })
      ).toBeInTheDocument();
    });

    it("clears the value and tells the caller", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onRemove = vi.fn();
      render(
        <ImageInput
          value={imageFile()}
          onValueChange={onValueChange}
          onRemove={onRemove}
          removeLabel="Hapus foto"
        />
      );

      await user.click(screen.getByRole("button", { name: "Hapus foto" }));

      expect(onValueChange).toHaveBeenCalledWith(null);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("resets the native control so the same file can be picked again", async () => {
      const user = userEvent.setup();
      render(<ImageInput value={imageFile()} removeLabel="Hapus foto" />);

      await user.click(screen.getByRole("button", { name: "Hapus foto" }));

      expect(control().value).toBe("");
    });

    it("does not submit the form it sits in", () => {
      render(<ImageInput value={imageFile()} removeLabel="Hapus foto" />);
      expect(screen.getByRole("button", { name: "Hapus foto" })).toHaveAttribute(
        "type",
        "button"
      );
    });
  });

  describe("object URLs", () => {
    // The reason this is a component. Every one of these assertions is about a
    // leak that leaves no trace on screen.
    it("releases the old URL when the file changes", () => {
      const { rerender } = render(<ImageInput value={imageFile("satu.png")} />);
      const first = preview()!.getAttribute("src")!;
      expect(liveObjectUrls.has(first)).toBe(true);

      rerender(<ImageInput value={imageFile("dua.png")} />);

      expect(liveObjectUrls.has(first)).toBe(false);
      expect(liveObjectUrls.has(preview()!.getAttribute("src")!)).toBe(true);
    });

    it("releases the URL on unmount", () => {
      const { unmount } = render(<ImageInput value={imageFile()} />);
      const url = preview()!.getAttribute("src")!;
      expect(liveObjectUrls.has(url)).toBe(true);

      unmount();

      expect(liveObjectUrls.has(url)).toBe(false);
    });

    it("creates none for a stored picture", () => {
      const before = liveObjectUrls.size;
      render(<ImageInput src="https://example.test/moni.png" />);
      expect(liveObjectUrls.size).toBe(before);
    });
  });

  describe("disabled", () => {
    it("disables the native control", () => {
      render(<ImageInput disabled />);
      expect(control()).toBeDisabled();
    });

    it("hides the remove button", () => {
      render(<ImageInput disabled value={imageFile()} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
