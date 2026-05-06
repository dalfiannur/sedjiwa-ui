import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell, TableCaption,
} from "./table";

describe("<Table />", () => {
  it("renders a table inside a scrollable container", () => {
    render(
      <Table data-testid="t">
        <TableBody>
          <TableRow>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("t").tagName).toBe("TABLE");
  });

  it("subcomponents apply their data-slot", () => {
    render(
      <Table>
        <TableHeader data-testid="th">
          <TableRow><TableHead>H</TableHead></TableRow>
        </TableHeader>
        <TableBody data-testid="tb">
          <TableRow><TableCell>c</TableCell></TableRow>
        </TableBody>
        <TableFooter data-testid="tf">
          <TableRow><TableCell>f</TableCell></TableRow>
        </TableFooter>
        <TableCaption data-testid="cap">caption</TableCaption>
      </Table>
    );
    expect(screen.getByTestId("th")).toHaveAttribute("data-slot", "table-header");
    expect(screen.getByTestId("tb")).toHaveAttribute("data-slot", "table-body");
    expect(screen.getByTestId("tf")).toHaveAttribute("data-slot", "table-footer");
    expect(screen.getByTestId("cap")).toHaveAttribute("data-slot", "table-caption");
  });

  it("renders a row with header and cell content", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });
});
