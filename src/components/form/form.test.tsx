import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import {
  Form, FormField, FormItem, FormLabel, FormControl,
  FormDescription, FormMessage,
} from "./form";

function TestForm({ onSubmit }: { onSubmit: (data: { email: string }) => void }) {
  const form = useForm({ defaultValues: { email: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input {...field} aria-label="email-input" />
              </FormControl>
              <FormDescription>Your email address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("<Form />", () => {
  it("renders label, control, and description", () => {
    render(<TestForm onSubmit={() => {}} />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("email-input")).toBeInTheDocument();
    expect(screen.getByText("Your email address")).toBeInTheDocument();
  });

  it("does not render the message when there is no error", () => {
    render(<TestForm onSubmit={() => {}} />);
    expect(screen.queryByText("Email required")).not.toBeInTheDocument();
  });

  it("renders the validation message after a failed submit", async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={() => {}} />);
    await user.click(screen.getByText("Submit"));
    expect(await screen.findByText("Email required")).toBeInTheDocument();
  });

  // Without role="alert" a validation failure is silent to a screen reader at
  // the moment it happens: aria-describedby only pays off if you navigate back
  // to the field. FormMessage renders null until there is a message, so it
  // mounts exactly on error — the case role="alert" exists for.
  it("announces the validation error when it appears", async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={() => {}} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email required");
    // And it is still the element the input points at, not a second node.
    expect(screen.getByLabelText("email-input")).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining(alert.id),
    );
  });

});
