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

describe("<EmptyState /> tone", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Belum ada kendaraan" description="Tambahkan satu." />);
    expect(screen.getByText("Belum ada kendaraan")).toBeInTheDocument();
    expect(screen.getByText("Tambahkan satu.")).toBeInTheDocument();
  });

  it("omits the media slot when no icon is given", () => {
    const { container } = render(<EmptyState title="x" />);
    expect(container.querySelector('[data-slot="empty-media"]')).toBeNull();
  });

  it("defaults the media tone to default", () => {
    const { container } = render(<EmptyState title="x" icon={<svg />} />);
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).toHaveAttribute("data-tone", "default");
    expect(media).toHaveClass("bg-muted");
    expect(media).toHaveClass("text-foreground");
  });

  it("applies the success tone for resolved-state emptiness", () => {
    const { container } = render(
      <EmptyState title="x" icon={<svg />} tone="success" />
    );
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).toHaveAttribute("data-tone", "success");
    expect(media).toHaveClass("bg-success-subtle");
    expect(media).toHaveClass("text-success-text");
  });

  it("applies the muted tone for filtered-to-nothing emptiness", () => {
    const { container } = render(
      <EmptyState title="x" icon={<svg />} tone="muted" />
    );
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).toHaveAttribute("data-tone", "muted");
    expect(media).toHaveClass("bg-muted");
    expect(media).toHaveClass("text-muted-foreground");
  });

  it("does not tone the default media variant", () => {
    const { container } = render(
      <EmptyMedia data-testid="m" tone="success">
        <svg />
      </EmptyMedia>
    );
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).not.toHaveClass("bg-success-subtle");
  });
});
