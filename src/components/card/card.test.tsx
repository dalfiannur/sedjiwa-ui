import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";

describe("<Card />", () => {
  it("renders children inside a div with the data-slot marker", () => {
    render(<Card data-testid="card">body</Card>);
    const el = screen.getByTestId("card");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveAttribute("data-slot", "card");
    expect(el).toHaveTextContent("body");
  });

  it("merges consumer className with default classes", () => {
    render(
      <Card data-testid="card" className="custom">
        x
      </Card>
    );
    const el = screen.getByTestId("card");
    expect(el).toHaveClass("custom");
    expect(el.className).toContain("bg-card");
  });

  it("applies data-slot to each sub-component", () => {
    render(
      <Card>
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Title</CardTitle>
          <CardDescription data-testid="desc">Desc</CardDescription>
          <CardAction data-testid="action">A</CardAction>
        </CardHeader>
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    );
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-slot",
      "card-header"
    );
    expect(screen.getByTestId("title")).toHaveAttribute(
      "data-slot",
      "card-title"
    );
    expect(screen.getByTestId("desc")).toHaveAttribute(
      "data-slot",
      "card-description"
    );
    expect(screen.getByTestId("action")).toHaveAttribute(
      "data-slot",
      "card-action"
    );
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "card-content"
    );
    expect(screen.getByTestId("footer")).toHaveAttribute(
      "data-slot",
      "card-footer"
    );
  });

  it("forwards arbitrary props to the underlying div", () => {
    render(<Card data-testid="card" aria-label="Vehicle" />);
    expect(screen.getByTestId("card")).toHaveAttribute("aria-label", "Vehicle");
  });
});
