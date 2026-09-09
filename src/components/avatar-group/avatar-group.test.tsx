import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvatarGroup } from "./avatar-group";
import { Avatar, AvatarFallback } from "../avatar";

function faces(n: number) {
  return Array.from({ length: n }, (_, i) => (
    <Avatar key={i}>
      <AvatarFallback>{`P${i + 1}`}</AvatarFallback>
    </Avatar>
  ));
}

describe("<AvatarGroup />", () => {
  // Three portraits plus "+15" means eighteen people to someone looking at it
  // and nothing at all to a screen reader, so the group carries one name.
  it("speaks a single name for the whole stack", () => {
    render(<AvatarGroup>{faces(3)}</AvatarGroup>);
    expect(screen.getByRole("img", { name: "3 orang" })).toBeInTheDocument();
  });

  it("counts everyone when total exceeds the faces given", () => {
    render(<AvatarGroup total={18}>{faces(3)}</AvatarGroup>);
    expect(screen.getByRole("img", { name: "18 orang" })).toBeInTheDocument();
  });

  it("shows at most `max` faces", () => {
    const { container } = render(<AvatarGroup max={2}>{faces(5)}</AvatarGroup>);
    expect(container.querySelectorAll('[data-slot="avatar"]')).toHaveLength(2);
  });

  it("collapses the remainder into a counter", () => {
    const { container } = render(<AvatarGroup max={2}>{faces(5)}</AvatarGroup>);
    expect(
      container.querySelector('[data-slot="avatar-group-overflow"]'),
    ).toHaveTextContent("+3");
  });

  // With `total` given, the hidden remainder includes people who were never
  // passed as children at all — counting against the children would undercount.
  it("counts the overflow against what is on screen, not against the children", () => {
    const { container } = render(
      <AvatarGroup max={3} total={18}>
        {faces(3)}
      </AvatarGroup>,
    );
    expect(
      container.querySelector('[data-slot="avatar-group-overflow"]'),
    ).toHaveTextContent("+15");
  });

  it("omits the counter when nothing is hidden", () => {
    const { container } = render(<AvatarGroup max={5}>{faces(3)}</AvatarGroup>);
    expect(
      container.querySelector('[data-slot="avatar-group-overflow"]'),
    ).toBeNull();
  });

  it("never renders a negative remainder", () => {
    const { container } = render(
      <AvatarGroup max={5} total={2}>
        {faces(4)}
      </AvatarGroup>,
    );
    expect(
      container.querySelector('[data-slot="avatar-group-overflow"]'),
    ).toBeNull();
  });

  // The ring in the surface colour is what keeps overlapping faces legible;
  // without it they read as one smear.
  it("rings each face in the surface colour", () => {
    const { container } = render(<AvatarGroup>{faces(2)}</AvatarGroup>);
    expect(container.firstChild).toHaveClass("[&>*]:ring-2");
    expect(container.firstChild).toHaveClass("[&>*]:ring-card");
  });

  // A `contents` wrapper generates no box, so the ring and size would land on
  // nothing. The faces have to be direct children.
  it("renders faces as direct children of the stack", () => {
    const { container } = render(<AvatarGroup>{faces(2)}</AvatarGroup>);
    const group = container.firstChild as HTMLElement;
    for (const child of Array.from(group.children).slice(0, 2)) {
      expect(child).toHaveAttribute("data-slot", "avatar");
    }
  });

  it("takes custom wording", () => {
    render(
      <AvatarGroup
        total={18}
        max={3}
        formatLabel={(n) => `${n} peserta`}
        formatOverflow={(n) => `${n}+`}
      >
        {faces(3)}
      </AvatarGroup>,
    );
    expect(screen.getByRole("img", { name: "18 peserta" })).toBeInTheDocument();
    expect(screen.getByText("15+")).toBeInTheDocument();
  });
});
