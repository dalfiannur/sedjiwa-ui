import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./index";

describe("<Pagination /> (standalone)", () => {
  // It is exported so apps needing pagination outside a SmartTable do not
  // rebuild it — and lose the accessibility that is already right here.
  it("is usable on its own, with the nav landmark intact", () => {
    render(
      <Pagination page={2} pageSize={10} total={57} onPageChange={() => {}} />,
    );
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Page 2")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  // Paging swaps rows silently otherwise: nothing tells a screen reader user
  // that the page changed or what range they are on now.
  it("announces the range politely", () => {
    render(
      <Pagination page={2} pageSize={10} total={57} onPageChange={() => {}} />,
    );
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();
    expect(live).toHaveAttribute("aria-atomic", "true");
    expect(live).toHaveTextContent("Showing 11–20 of 57, page 2 of 6");
  });

  // When the app supplies its own localized summary, that is what should be
  // announced — not a second English sentence alongside it.
  it("announces the app's own summary when given one", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={57}
        onPageChange={() => {}}
        renderSummary={({ from, to, total }) =>
          `Menampilkan ${from}–${to} dari ${total}`
        }
      />,
    );
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("Menampilkan 1–10 dari 57");
    expect(live).not.toHaveTextContent("Showing");
  });

  it("still drives page changes", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={2} pageSize={10} total={57} onPageChange={onPageChange} />,
    );
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
