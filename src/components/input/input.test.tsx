import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mail, X } from "lucide-react";
import { Input } from "./input";

function renderField(
  rootProps: Partial<React.ComponentProps<typeof Input.Root>> = {},
  fieldProps: Partial<React.ComponentProps<typeof Input.Field>> = {},
) {
  return render(
    <Input.Root {...rootProps}>
      <Input.Field data-testid="field" {...fieldProps} />
    </Input.Root>,
  );
}

describe("<Input.Root />", () => {
  it("renders an input element via Input.Field", () => {
    renderField();
    expect(screen.getByTestId("field").tagName).toBe("INPUT");
  });

  it("applies data-slot=input on the wrapper and data-slot=input-field on the input", () => {
    const { container } = renderField();
    expect(container.querySelector('[data-slot="input"]')).not.toBeNull();
    expect(screen.getByTestId("field")).toHaveAttribute(
      "data-slot",
      "input-field",
    );
  });

  it("applies data-state=default by default and reflects size on the wrapper", () => {
    const { container } = renderField({ size: "lg" });
    const root = container.querySelector('[data-slot="input"]');
    expect(root).toHaveAttribute("data-state", "default");
    expect(root).toHaveClass("h-10");
  });

  it("forwards type and value props to the inner input", () => {
    renderField({}, { type: "email", defaultValue: "a@b.com" });
    const input = screen.getByTestId("field") as HTMLInputElement;
    expect(input.type).toBe("email");
    expect(input.value).toBe("a@b.com");
  });

  it("calls onChange when typed into", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Input.Root>
        <Input.Field aria-label="name" onChange={onChange} />
      </Input.Root>,
    );
    await user.type(screen.getByLabelText("name"), "Ada");
    expect(onChange).toHaveBeenCalled();
  });

  it("merges consumer className on the wrapper", () => {
    const { container } = render(
      <Input.Root className="custom-wrap" data-testid="wrap">
        <Input.Field />
      </Input.Root>,
    );
    expect(container.querySelector('[data-slot="input"]')).toHaveClass(
      "custom-wrap",
    );
  });

  it("renders sub-components in tree order", () => {
    const { container } = render(
      <Input.Root>
        <Input.LeadingIcon>
          <Mail data-testid="mail" />
        </Input.LeadingIcon>
        <Input.LeadingAddon>https://</Input.LeadingAddon>
        <Input.Field data-testid="field" />
        <Input.TrailingAddon>.com</Input.TrailingAddon>
      </Input.Root>,
    );
    const slots = container.querySelectorAll("[data-slot]");
    const slotNames = Array.from(slots).map((el) => el.getAttribute("data-slot"));
    expect(slotNames).toContain("input");
    expect(slotNames).toContain("input-leading-icon");
    expect(slotNames).toContain("input-leading-addon");
    expect(slotNames).toContain("input-field");
    expect(slotNames).toContain("input-trailing-addon");
    expect(screen.getByTestId("mail")).toBeInTheDocument();
  });

  it("forwards FormControl-cloned id and aria-describedby to the inner input, not the wrapper", () => {
    // Simulating what <FormControl> does via Slot — in practice it clones the
    // child <Input.Root> and adds these props.
    const { container } = render(
      <Input.Root id="form-id-123" aria-describedby="desc-1 msg-1">
        <Input.Field data-testid="field" />
      </Input.Root>,
    );
    const wrapper = container.querySelector('[data-slot="input"]');
    const field = screen.getByTestId("field");
    // Wrapper should NOT carry the id/aria-describedby
    expect(wrapper).not.toHaveAttribute("id");
    expect(wrapper).not.toHaveAttribute("aria-describedby");
    // Field should
    expect(field).toHaveAttribute("id", "form-id-123");
    expect(field).toHaveAttribute("aria-describedby", "desc-1 msg-1");
  });

  it("infers state=error when aria-invalid=true is forwarded by FormControl", () => {
    const { container } = render(
      <Input.Root aria-invalid={true}>
        <Input.Field data-testid="field" />
      </Input.Root>,
    );
    expect(container.querySelector('[data-slot="input"]')).toHaveAttribute(
      "data-state",
      "error",
    );
    expect(screen.getByTestId("field")).toHaveAttribute("aria-invalid", "true");
  });

  it("explicit state='success' overrides inherited aria-invalid", () => {
    const { container } = render(
      <Input.Root state="success" aria-invalid={true}>
        <Input.Field data-testid="field" />
      </Input.Root>,
    );
    expect(container.querySelector('[data-slot="input"]')).toHaveAttribute(
      "data-state",
      "success",
    );
  });

  it("auto-injects an error icon when state='error' and no TrailingIcon is provided", () => {
    const { container } = render(
      <Input.Root state="error">
        <Input.Field />
      </Input.Root>,
    );
    const auto = container.querySelector(
      '[data-slot="input-trailing-icon"][data-auto="true"]',
    );
    expect(auto).not.toBeNull();
  });

  it("does NOT auto-inject an icon when consumer supplies <Input.TrailingIcon>", () => {
    const { container } = render(
      <Input.Root state="error">
        <Input.Field />
        <Input.TrailingIcon>
          <X />
        </Input.TrailingIcon>
      </Input.Root>,
    );
    expect(
      container.querySelector(
        '[data-slot="input-trailing-icon"][data-auto="true"]',
      ),
    ).toBeNull();
  });

  it("DOES auto-inject when only <Input.Action> is supplied, placing the icon BEFORE the action", () => {
    const { container } = render(
      <Input.Root state="success">
        <Input.Field />
        <Input.Action data-testid="action">
          <X />
        </Input.Action>
      </Input.Root>,
    );
    const auto = container.querySelector(
      '[data-slot="input-trailing-icon"][data-auto="true"]',
    );
    const action = container.querySelector('[data-slot="input-action"]');
    expect(auto).not.toBeNull();
    expect(action).not.toBeNull();
    // DOM order: auto-icon before action
    expect(
      auto!.compareDocumentPosition(action!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("does not auto-inject for state='default'", () => {
    const { container } = render(
      <Input.Root>
        <Input.Field />
      </Input.Root>,
    );
    expect(
      container.querySelector('[data-slot="input-trailing-icon"]'),
    ).toBeNull();
  });

  it("renders a loading spinner and sets aria-busy on Field when loading=true", () => {
    const { container } = render(
      <Input.Root loading>
        <Input.Field data-testid="field" />
      </Input.Root>,
    );
    expect(container.querySelector('[data-slot="input-loading"]')).not.toBeNull();
    expect(screen.getByTestId("field")).toHaveAttribute("aria-busy", "true");
  });

  it("loading wins over auto-icon", () => {
    const { container } = render(
      <Input.Root state="error" loading>
        <Input.Field />
      </Input.Root>,
    );
    expect(container.querySelector('[data-slot="input-loading"]')).not.toBeNull();
    expect(
      container.querySelector('[data-slot="input-trailing-icon"][data-auto="true"]'),
    ).toBeNull();
  });

  it("blocks interaction while loading=true (pointer-events:none + onChange detached)", () => {
    const onChange = vi.fn();
    render(
      <Input.Root loading>
        <Input.Field aria-label="email" onChange={onChange} />
      </Input.Root>,
    );
    const input = screen.getByLabelText("email") as HTMLInputElement;
    expect(input.style.pointerEvents).toBe("none");
    expect(input).toHaveAttribute("aria-busy", "true");
  });

  it("disabled=true on Root disables the inner input", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Input.Root disabled>
        <Input.Field aria-label="name" onChange={onChange} />
      </Input.Root>,
    );
    const input = screen.getByLabelText("name") as HTMLInputElement;
    expect(input).toBeDisabled();
    await user.type(input, "x");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("readOnly=true on Root makes the inner input readOnly", () => {
    render(
      <Input.Root readOnly>
        <Input.Field aria-label="name" />
      </Input.Root>,
    );
    const input = screen.getByLabelText("name") as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
  });

  it("forwards ref to the wrapper div on Input.Root", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Input.Root ref={ref}>
        <Input.Field />
      </Input.Root>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "input");
  });

  it("forwards ref to the input element on Input.Field", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(
      <Input.Root>
        <Input.Field ref={ref} />
      </Input.Root>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("Input.Action click fires when not loading", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Input.Root>
        <Input.Field />
        <Input.Action onClick={onClick} aria-label="clear">
          <X />
        </Input.Action>
      </Input.Root>,
    );
    await user.click(screen.getByLabelText("clear"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Input.Action is disabled when Root is loading", () => {
    render(
      <Input.Root loading>
        <Input.Field />
        <Input.Action aria-label="clear">
          <X />
        </Input.Action>
      </Input.Root>,
    );
    expect(screen.getByLabelText("clear")).toBeDisabled();
  });

  it("throws a friendly error if a sub-component is rendered without Input.Root", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Input.Field />)).toThrow(
      /must be rendered inside <Input\.Root>/,
    );
    errorSpy.mockRestore();
  });
});
