import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyState,
} from "./empty-state";

describe("Empty primitives", () => {
  it("applies data-slot to each part", () => {
    render(
      <Empty data-testid="root">
        <EmptyHeader data-testid="header">
          <EmptyMedia data-testid="media" variant="icon">
            <svg />
          </EmptyMedia>
          <EmptyTitle data-testid="title">Kosong</EmptyTitle>
          <EmptyDescription data-testid="desc">Tidak ada data</EmptyDescription>
        </EmptyHeader>
        <EmptyContent data-testid="content">action</EmptyContent>
      </Empty>
    );
    expect(screen.getByTestId("root")).toHaveAttribute("data-slot", "empty");
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-slot",
      "empty-header"
    );
    expect(screen.getByTestId("media")).toHaveAttribute(
      "data-slot",
      "empty-media"
    );
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "icon");
    expect(screen.getByTestId("title")).toHaveAttribute(
      "data-slot",
      "empty-title"
    );
    expect(screen.getByTestId("desc")).toHaveAttribute(
      "data-slot",
      "empty-description"
    );
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "empty-content"
    );
  });
});

describe("<EmptyState />", () => {
  it("renders title as an empty-title", () => {
    render(<EmptyState title="Belum ada kendaraan" />);
    const title = screen.getByText("Belum ada kendaraan");
    expect(title).toHaveAttribute("data-slot", "empty-title");
  });

  it("omits icon, description and action when not provided", () => {
    render(<EmptyState data-testid="root" title="Kosong" />);
    const root = screen.getByTestId("root");
    expect(
      root.querySelector('[data-slot="empty-media"]')
    ).not.toBeInTheDocument();
    expect(
      root.querySelector('[data-slot="empty-description"]')
    ).not.toBeInTheDocument();
    expect(
      root.querySelector('[data-slot="empty-content"]')
    ).not.toBeInTheDocument();
  });

  it("renders icon, description and action when provided", () => {
    render(
      <EmptyState
        data-testid="root"
        icon={<svg data-testid="icon" />}
        title="Kosong"
        description="Coba ubah filter"
        action={<button>Reset</button>}
      />
    );
    const root = screen.getByTestId("root");
    expect(root.querySelector('[data-slot="empty-media"]')).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Coba ubah filter")).toHaveAttribute(
      "data-slot",
      "empty-description"
    );
    expect(
      screen.getByRole("button", { name: "Reset" })
    ).toBeInTheDocument();
  });

  it("merges consumer className onto the root", () => {
    render(<EmptyState data-testid="root" className="custom" title="x" />);
    expect(screen.getByTestId("root")).toHaveClass("custom");
  });
});
