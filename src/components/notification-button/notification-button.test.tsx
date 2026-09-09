import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationButton } from "./notification-button";

describe("<NotificationButton />", () => {
  it("names itself even with nothing unread", () => {
    render(<NotificationButton />);
    expect(screen.getByRole("button", { name: "Notifikasi" })).toBeInTheDocument();
  });

  it("folds the count into the accessible name", () => {
    render(<NotificationButton count={6} />);
    expect(
      screen.getByRole("button", { name: "Notifikasi, 6 belum dibaca" }),
    ).toBeInTheDocument();
  });

  // A badge reading "0" is noise: the absence of a badge already says it.
  it.each([[0], [undefined]])("renders no badge for a count of %s", (count) => {
    const { container } = render(<NotificationButton count={count} />);
    expect(
      container.querySelector('[data-slot="notification-button-count"]'),
    ).toBeNull();
  });

  it("caps the displayed count", () => {
    const { container } = render(<NotificationButton count={150} max={99} />);
    expect(
      container.querySelector('[data-slot="notification-button-count"]'),
    ).toHaveTextContent("99+");
  });

  // aria-label replaces the subtree, so the visible badge must not also be
  // announced -- otherwise the count is either doubled or read as bare digits.
  it("hides the badge from assistive tech", () => {
    const { container } = render(<NotificationButton count={6} />);
    expect(
      container.querySelector('[data-slot="notification-button-count"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("takes a custom count wording", () => {
    render(
      <NotificationButton
        count={2}
        label="Pesan"
        countLabel={(n) => `${n} pesan baru`}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Pesan, 2 pesan baru" }),
    ).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<NotificationButton count={1} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
