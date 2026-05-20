import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Combobox } from "./combobox";

const FRUITS = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
];

function fruitValue(f: { id: string }) {
  return f.id;
}
function fruitLabel(f: { name: string }) {
  return f.name;
}

describe("<Combobox />", () => {
  describe("scaffold", () => {
    it("renders a trigger button with the default placeholder", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
        />,
      );
      expect(
        screen.getByRole("combobox", { name: /select/i }),
      ).toBeInTheDocument();
    });

    it("uses a custom placeholder", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          placeholder="Pick a fruit"
        />,
      );
      expect(
        screen.getByRole("combobox", { name: /pick a fruit/i }),
      ).toBeInTheDocument();
    });
  });
});
