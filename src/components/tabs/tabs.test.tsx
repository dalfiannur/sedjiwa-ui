import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

describe("<Tabs />", () => {
  it("renders the default-active panel only", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel A</TabsContent>
        <TabsContent value="b">panel B</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("panel A")).toBeInTheDocument();
    expect(screen.queryByText("panel B")).not.toBeInTheDocument();
  });

  it("switches panel on tab click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel A</TabsContent>
        <TabsContent value="b">panel B</TabsContent>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("panel B")).toBeInTheDocument();
    expect(screen.queryByText("panel A")).not.toBeInTheDocument();
  });

  it("triggers carry data-slot=tabs-trigger", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel A</TabsContent>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("data-slot", "tabs-trigger");
  });
});
