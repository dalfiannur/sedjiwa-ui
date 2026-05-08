import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  title: "Components/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open right sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Refine the results.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="text-sm text-muted-foreground">
            Side sheets are width-bounded (`w-3/4 sm:max-w-sm`) and full
            viewport height. Wrap long content in <code>SheetBody</code> for a
            consistent scroll region.
          </p>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Jump to a section.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <ul className="grid gap-1 text-sm">
            <li>Dashboard</li>
            <li>Projects</li>
            <li>Settings</li>
          </ul>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

// Top sheet: rounded-b-2xl, drag-handle indicator at the bottom edge,
// pt-[env(safe-area-inset-top)] padding so iOS notch / Android status bar
// doesn't overlap content.
export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open top sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Recent activity.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="text-sm text-muted-foreground">
            Drops down from the top with rounded bottom corners and a drag
            handle indicator.
          </p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

// Bottom sheet: rounded-t-2xl, drag-handle indicator at the top, and
// pb-[env(safe-area-inset-bottom)] so the iPhone home indicator doesn't
// overlap action buttons. Inspect with iOS device emulation in DevTools to
// see the safe-area gap.
export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open bottom sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Share</SheetTitle>
          <SheetDescription>Choose where to send the link.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border p-3 text-center">Email</div>
            <div className="rounded-lg border p-3 text-center">Messages</div>
            <div className="rounded-lg border p-3 text-center">Copy link</div>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

// Validates the new max-h-[calc(100dvh-2rem)] on bottom Sheet plus
// SheetBody's scroll region. The sheet stays inside the viewport even with
// many fields; only the body scrolls.
export const BottomLongForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open long form</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Contact details</SheetTitle>
          <SheetDescription>Header pinned, body scrolls.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="grid gap-3 py-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="grid gap-1.5">
                <Label htmlFor={`field-${i}`}>Field {i + 1}</Label>
                <Input.Root id={`field-${i}`}>
                  <Input.Field placeholder={`Enter value ${i + 1}`} />
                </Input.Root>
              </div>
            ))}
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const HiddenDragHandle: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open without drag handle</Button>
      </SheetTrigger>
      <SheetContent side="bottom" showDragHandle={false}>
        <SheetHeader>
          <SheetTitle>Quiet sheet</SheetTitle>
          <SheetDescription>
            Drag affordance is suppressed via <code>showDragHandle=false</code>.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="text-sm text-muted-foreground">
            Useful when the sheet isn&apos;t expected to be swipe-dismissable.
          </p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};
