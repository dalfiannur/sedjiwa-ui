/* Every form control, standalone and wired to react-hook-form.
 *
 * Ported from the Vite playground when Storybook became the only preview
 * surface. The individual component stories cover each control's own variants;
 * what this page adds is the two of them in one place — a control on its own
 * beside the same control inside `FormField`, where the aria wiring and the
 * error rendering are the thing being shown.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { Mail, Search, X } from "lucide-react";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/form";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";
import { Switch } from "../components/switch";
import { Textarea } from "../components/textarea";


type FormValues = {
  email: string;
  bio: string;
  channel: "email" | "sms" | "push";
  agree: boolean;
  autosave: boolean;
};

const meta: Meta = {
  title: "Recipes/Forms",
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj;

/** Every form control on one page, standalone and inside react-hook-form. */
export const Default: Story = {
  render: () => (
    <div className="space-y-12">
      <PrimitivesShowcase />
      <RHFShowcase />
    </div>
  ),
};

/** The controls on their own — size and state variants, no form library. */
export const Primitives: Story = {
  render: () => <PrimitivesShowcase />,
};

/**
 * The wiring that matters: `FormControl` injects `aria-invalid` into whatever
 * it wraps, and `FormMessage` renders react-hook-form's error. Submit with the
 * email empty to see both fire.
 */
export const WithReactHookForm: Story = {
  render: () => <RHFShowcase />,
};

function PrimitivesShowcase() {
  const [val, setVal] = useState("");
  const [autosave, setAutosave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agree, setAgree] = useState<boolean | "indeterminate">("indeterminate");
  const [channel, setChannel] = useState("email");

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-medium">Form primitives — standalone</h2>
        <p className="text-sm text-muted-foreground">
          Each control without react-hook-form, demonstrating size and state
          variants directly.
        </p>
      </header>

      <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Search (with leading icon)</Label>
          <Input.Root>
            <Input.LeadingIcon>
              <Search />
            </Input.LeadingIcon>
            <Input.Field
              placeholder="Search anything…"
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
            {val && (
              <Input.Action onClick={() => setVal("")} aria-label="Clear">
                <X />
              </Input.Action>
            )}
          </Input.Root>
        </div>

        <div className="space-y-2">
          <Label>URL (addons)</Label>
          <Input.Root>
            <Input.LeadingAddon>https://</Input.LeadingAddon>
            <Input.Field placeholder="example" />
            <Input.TrailingAddon>.com</Input.TrailingAddon>
          </Input.Root>
        </div>

        <div className="space-y-2">
          <Label>Error state — auto-icon</Label>
          <Input.Root state="error">
            <Input.LeadingIcon>
              <Mail />
            </Input.LeadingIcon>
            <Input.Field defaultValue="not-an-email" />
          </Input.Root>
        </div>

        <div className="space-y-2">
          <Label>Success state</Label>
          <Input.Root state="success">
            <Input.Field defaultValue="ada@example.com" />
          </Input.Root>
        </div>

        <div className="space-y-2">
          <Label>Warning state</Label>
          <Input.Root state="warning">
            <Input.Field defaultValue="ada@exmple.com" />
          </Input.Root>
        </div>

        <div className="space-y-2">
          <Label>Loading state</Label>
          <Input.Root loading>
            <Input.Field defaultValue="checking@example.com" />
          </Input.Root>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label>Bio (textarea)</Label>
          <Textarea placeholder="Tell us about yourself…" />
        </div>
      </div>

      <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label>Notification channel</Label>
          <RadioGroup value={channel} onValueChange={setChannel}>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="ps-email" value="email" />
              <Label htmlFor="ps-email">Email</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="ps-sms" value="sms" />
              <Label htmlFor="ps-sms">SMS</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="ps-push" value="push" />
              <Label htmlFor="ps-push">Push notification</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Toggles</Label>
          <div className="flex items-center gap-3">
            <Checkbox
              id="ps-agree"
              checked={agree}
              onCheckedChange={(c) => setAgree(c)}
            />
            <Label htmlFor="ps-agree">
              {agree === "indeterminate"
                ? "Some terms accepted"
                : agree
                  ? "All terms accepted"
                  : "No terms accepted"}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="ps-auto"
              checked={autosave}
              loading={saving}
              onCheckedChange={(v) => {
                setSaving(true);
                setTimeout(() => {
                  setAutosave(v);
                  setSaving(false);
                }, 1000);
              }}
            />
            <Label htmlFor="ps-auto">
              {saving ? "Saving…" : autosave ? "Autosave on" : "Autosave off"}
            </Label>
          </div>
        </div>
      </div>
    </section>
  );
}

function RHFShowcase() {
  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      bio: "",
      channel: "email",
      agree: false,
      autosave: true,
    },
    mode: "onBlur",
  });
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-medium">react-hook-form integration</h2>
        <p className="text-sm text-muted-foreground">
          Inputs respond to FormControl-injected aria-invalid; FormMessage
          renders RHF errors.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((vals) => setSubmitted(vals))}
          className="grid max-w-md gap-5"
        >
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input.Root>
                    <Input.LeadingIcon>
                      <Mail />
                    </Input.LeadingIcon>
                    <Input.Field
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </Input.Root>
                </FormControl>
                <FormDescription>
                  We'll send a verification code.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            rules={{ maxLength: { value: 200, message: "Keep it under 200 chars" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us about yourself…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred channel</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="rhf-email" value="email" />
                      <Label htmlFor="rhf-email">Email</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="rhf-sms" value="sms" />
                      <Label htmlFor="rhf-sms">SMS</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="rhf-push" value="push" />
                      <Label htmlFor="rhf-push">Push notification</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agree"
            rules={{ required: "You must accept the terms" }}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I accept the terms
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autosave"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Autosave</FormLabel>
                </div>
                <FormDescription>
                  Persist your draft as you type.
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setSubmitted(null);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>

      {submitted && (
        <pre className="max-w-md rounded-md border bg-muted/30 p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </section>
  );
}
