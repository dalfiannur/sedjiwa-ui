import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DataList,
  DataListItem,
  DataListLabel,
  DataListRoot,
  DataListValue,
} from "./data-list";
import { Badge } from "../badge";

const FIELDS = [
  { label: "Nama", value: "Budi Santoso" },
  { label: "Email", value: "budi@qyubit.io" },
  { label: "Dibuat", value: "10 Sep 2026" },
];

function slots(name: string): Element[] {
  return Array.from(document.querySelectorAll(`[data-slot="${name}"]`));
}

describe("<DataList />", () => {
  describe("semantics", () => {
    it("is a description list", () => {
      const { container } = render(<DataList items={FIELDS} />);
      expect(container.querySelector("dl")).toBeInTheDocument();
    });

    it("puts each label in a dt", () => {
      render(<DataList items={FIELDS} />);
      expect(screen.getByText("Nama").tagName).toBe("DT");
    });

    it("puts each value in a dd", () => {
      render(<DataList items={FIELDS} />);
      expect(screen.getByText("Budi Santoso").tagName).toBe("DD");
    });
  });

  describe("the preset", () => {
    it("renders one row per field", () => {
      render(<DataList items={FIELDS} />);
      expect(slots("data-list-item")).toHaveLength(3);
    });

    it("renders every label and value", () => {
      render(<DataList items={FIELDS} />);
      for (const field of FIELDS) {
        expect(screen.getByText(field.label)).toBeInTheDocument();
        expect(screen.getByText(field.value)).toBeInTheDocument();
      }
    });

    it("renders nothing at all for an empty list", () => {
      const { container } = render(<DataList items={[]} />);
      expect(container.querySelector("dl")).not.toBeInTheDocument();
    });

    it("takes a rich value, not just a string", () => {
      render(
        <DataList
          items={[{ label: "Status", value: <Badge>Aktif</Badge> }]}
        />,
      );
      expect(screen.getByText("Aktif")).toBeInTheDocument();
    });

    it("keeps rows in the order they were given", () => {
      render(<DataList items={FIELDS} />);
      const labels = slots("data-list-label").map((el) => el.textContent);
      expect(labels).toEqual(["Nama", "Email", "Dibuat"]);
    });

    it("lets a row carry its own key when labels repeat", () => {
      render(
        <DataList
          items={[
            { key: "a", label: "Telepon", value: "0812" },
            { key: "b", label: "Telepon", value: "0813" },
          ]}
        />,
      );
      expect(slots("data-list-item")).toHaveLength(2);
    });
  });

  describe("the compound form", () => {
    it("composes the same markup by hand", () => {
      render(
        <DataListRoot>
          <DataListItem>
            <DataListLabel>Nama</DataListLabel>
            <DataListValue>Budi Santoso</DataListValue>
          </DataListItem>
        </DataListRoot>,
      );
      expect(screen.getByText("Nama").tagName).toBe("DT");
      expect(screen.getByText("Budi Santoso").tagName).toBe("DD");
    });

    it("lets a value hold anything", () => {
      render(
        <DataListRoot>
          <DataListItem>
            <DataListLabel>Tautan</DataListLabel>
            <DataListValue>
              <a href="https://qyubit.io">Buka</a>
            </DataListValue>
          </DataListItem>
        </DataListRoot>,
      );
      expect(screen.getByRole("link", { name: "Buka" })).toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("is horizontal by default", () => {
      render(<DataList items={FIELDS} />);
      expect(slots("data-list")[0]).toHaveAttribute(
        "data-orientation",
        "horizontal",
      );
    });

    it("can be told to stack instead", () => {
      render(<DataList items={FIELDS} orientation="vertical" />);
      expect(slots("data-list")[0]).toHaveAttribute(
        "data-orientation",
        "vertical",
      );
    });

    // The label column is one width for the whole list, so the values line up
    // on a common left edge no matter how long each label is.
    it("publishes the label width as a custom property", () => {
      render(<DataList items={FIELDS} labelWidth="12rem" />);
      const root = slots("data-list")[0] as HTMLElement;
      expect(root.style.getPropertyValue("--data-list-label-width")).toBe(
        "12rem",
      );
    });
  });

  describe("sizes", () => {
    it("carries the size on the root", () => {
      render(<DataList items={FIELDS} size="sm" />);
      expect(slots("data-list")[0]).toHaveAttribute("data-size", "sm");
    });
  });
});
