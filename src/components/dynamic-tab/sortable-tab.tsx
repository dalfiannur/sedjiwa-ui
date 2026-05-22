import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Copy,
  Palette,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useKeyboardShortcut } from "../../hooks/use-keyboard-shortcut";
import { useDynamicTabContext } from "./dynamic-tab.context";
import { dynamicTabTriggerVariants } from "./dynamic-tab.variants";
import {
  DYNAMIC_TAB_COLORS,
  type DynamicTabColor,
  type DynamicTabItem,
} from "./dynamic-tab.types";

const COLOR_SWATCH_CLASS: Record<DynamicTabColor, string> = {
  default: "border border-border bg-transparent",
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

const MENU_ITEM_CLASS =
  "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export function SortableTab({ tab }: { tab: DynamicTabItem }) {
  const ctx = useDynamicTabContext();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const isActive = ctx.activeId === tab.id;
  const isRenaming = ctx.renameId === tab.id;
  const tabsCount = ctx.tabs.length;
  const isLast = tabsCount <= 1;
  const closable = tab.closable !== false && !isLast && !tab.disabled;
  const renamable = tab.renamable !== false && !tab.disabled;

  const sortable = useSortable({
    id: tab.id,
    disabled: !ctx.reorderable || isRenaming || tab.disabled,
  });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // F2 → rename; Delete → delete. Bound to the focused trigger element.
  useKeyboardShortcut(
    "f2",
    () => {
      if (renamable && !isRenaming) ctx.startRename(tab.id);
    },
    {
      target: triggerRef,
      enabled: isActive && !isRenaming,
      preventDefault: true,
    },
  );
  useKeyboardShortcut(
    "delete",
    () => {
      if (closable) ctx.requestDelete(tab.id);
    },
    {
      target: triggerRef,
      enabled: isActive && !isRenaming,
      preventDefault: true,
    },
  );

  const triggerClasses = cn(
    dynamicTabTriggerVariants({
      color: tab.color ?? "default",
      position: ctx.position,
      isDragging,
      isRenaming,
    }),
    ctx.reorderable && !isRenaming && "cursor-grab",
  );

  const triggerNode = isRenaming ? (
    <RenameInput
      initialLabel={tab.label}
      onCommit={(value) => ctx.commitRename(tab.id, value)}
      onCancel={ctx.cancelRename}
      className={triggerClasses}
    />
  ) : (
    <TabsPrimitive.Trigger
      ref={triggerRef}
      value={tab.id}
      disabled={tab.disabled}
      data-slot="dynamic-tab-trigger"
      data-color={tab.color ?? "default"}
      onDoubleClick={(e) => {
        if (!renamable) return;
        e.preventDefault();
        ctx.startRename(tab.id);
      }}
      className={triggerClasses}
    >
      <span data-slot="dynamic-tab-label" className="truncate">
        {tab.label}
      </span>
      {closable && (
        <span
          role="button"
          tabIndex={-1}
          aria-label={`Close ${tab.label}`}
          data-slot="dynamic-tab-close"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            ctx.requestDelete(tab.id);
          }}
          className="ml-1 inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover/dyn-tab:opacity-100 group-focus-within/dyn-tab:opacity-100 group-data-[state=active]/dyn-tab:opacity-100"
        >
          <X className="size-3" />
        </span>
      )}
    </TabsPrimitive.Trigger>
  );

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild disabled={tab.disabled}>
        <div
          ref={setNodeRef}
          style={style}
          data-slot="dynamic-tab-trigger-wrapper"
          data-dragging={isDragging || undefined}
          className={cn("inline-flex items-center", isDragging && "z-10")}
          {...(ctx.reorderable && !isRenaming ? attributes : {})}
          {...(ctx.reorderable && !isRenaming ? listeners : {})}
        >
          {triggerNode}
        </div>
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          data-slot="dynamic-tab-context-menu"
          className="bg-popover text-popover-foreground z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <ContextMenuPrimitive.Item
            disabled={!renamable}
            onSelect={() => ctx.startRename(tab.id)}
            className={MENU_ITEM_CLASS}
          >
            <Pencil /> Rename
          </ContextMenuPrimitive.Item>
          <ContextMenuPrimitive.Item
            onSelect={() => ctx.duplicateTab(tab.id)}
            className={MENU_ITEM_CLASS}
          >
            <Copy /> Duplicate
          </ContextMenuPrimitive.Item>
          <ContextMenuPrimitive.Sub>
            <ContextMenuPrimitive.SubTrigger
              className={cn(
                MENU_ITEM_CLASS,
                "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
              )}
            >
              <Palette /> Color
            </ContextMenuPrimitive.SubTrigger>
            <ContextMenuPrimitive.Portal>
              <ContextMenuPrimitive.SubContent
                className="bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md"
              >
                {DYNAMIC_TAB_COLORS.map((color) => (
                  <ContextMenuPrimitive.Item
                    key={color}
                    onSelect={() => ctx.setTabColor(tab.id, color)}
                    className={MENU_ITEM_CLASS}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "inline-block size-3 rounded-sm",
                        COLOR_SWATCH_CLASS[color],
                      )}
                    />
                    <span className="capitalize">{color}</span>
                    {(tab.color ?? "default") === color && (
                      <Check className="ml-auto" />
                    )}
                  </ContextMenuPrimitive.Item>
                ))}
              </ContextMenuPrimitive.SubContent>
            </ContextMenuPrimitive.Portal>
          </ContextMenuPrimitive.Sub>
          <ContextMenuPrimitive.Separator className="bg-border -mx-1 my-1 h-px" />
          <ContextMenuPrimitive.Item
            disabled={!closable}
            onSelect={() => ctx.requestDelete(tab.id)}
            className={cn(
              MENU_ITEM_CLASS,
              "text-destructive focus:bg-destructive/10 focus:text-destructive",
            )}
          >
            <Trash2 /> Delete
          </ContextMenuPrimitive.Item>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}

function RenameInput({
  initialLabel,
  onCommit,
  onCancel,
  className,
}: {
  initialLabel: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
  className?: string;
}) {
  const [value, setValue] = React.useState(initialLabel);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const settledRef = React.useRef(false);

  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const finish = (commit: boolean) => {
    if (settledRef.current) return;
    settledRef.current = true;
    if (commit) onCommit(value);
    else onCancel();
  };

  return (
    <input
      ref={inputRef}
      data-slot="dynamic-tab-rename-input"
      data-state="active"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          finish(true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          finish(false);
        } else {
          e.stopPropagation();
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onBlur={() => finish(true)}
      className={cn(
        className,
        "min-w-[3ch] max-w-[20ch] outline-none ring-1 ring-ring/50",
      )}
      style={{ width: `${Math.max(value.length, 3) + 2}ch` }}
    />
  );
}
