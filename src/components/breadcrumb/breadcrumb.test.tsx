import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";

describe("<Breadcrumb />", () => {
  it("root has aria-label=breadcrumb", () => {
    render(<Breadcrumb data-testid="bc"><BreadcrumbList /></Breadcrumb>);
    expect(screen.getByTestId("bc")).toHaveAttribute("aria-label", "breadcrumb");
  });

  it("renders link with href", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/x">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/x");
  });

  it("BreadcrumbPage marks aria-current=page", () => {
    render(<BreadcrumbPage>Current</BreadcrumbPage>);
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page");
  });

  it("BreadcrumbSeparator renders default chevron when no children", () => {
    const { container } = render(<BreadcrumbSeparator />);
    expect(container.querySelector("[data-slot=breadcrumb-separator]")).toBeTruthy();
  });

  it("BreadcrumbEllipsis includes sr-only text 'More'", () => {
    render(<BreadcrumbEllipsis />);
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});
