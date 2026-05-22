import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../alert-dialog/alert-dialog";
import { Button } from "../button/button";
import {
  DynamicTabContext,
  type DynamicTabContextValue,
} from "./dynamic-tab.context";
import { dynamicTabStripVariants } from "./dynamic-tab.variants";
import { SortableTab } from "./sortable-tab";
import type {
  DynamicTabColor,
  DynamicTabItem,
  DynamicTabPanelProps,
  DynamicTabProps,
} from "./dynamic-tab.types";

let _autoId = 0;
function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dyn-tab-${Date.now()}-${++_autoId}`;
}

function nextSheetLabel(tabs: ReadonlyArray<DynamicTabItem>): string {
  const existing = new Set(tabs.map((t) => t.label.toLowerCase()));
  let n = tabs.length + 1;
  while (existing.has(`sheet${n}`)) n++;
  return `Sheet${n}`;
}

export function DynamicTab(props: DynamicTabProps) {
  const {
    tabs: tabsProp,
    defaultTabs,
    onTabsChange,
    activeTabId,
    defaultActiveTabId,
    onActiveTabChange,
    position = "bottom",
    addable = true,
    reorderable = true,
    confirmDelete = true,
    onAdd,
    onRename,
    onDelete,
    onDuplicate,
    onColorChange,
    addLabel = "Add tab",
    deleteConfirmTitle = "Delete this tab?",
    deleteConfirmDescription,
    deleteConfirmActionLabel = "Delete",
    deleteConfirmCancelLabel = "Cancel",
    children,
    className,
  } = props;

  // -- Tabs state (controlled / uncontrolled) --
  const isTabsControlled = tabsProp !== undefined;
  const [uncontrolledTabs, setUncontrolledTabs] = React.useState<DynamicTabItem[]>(
    () =>
      defaultTabs ?? [
        { id: defaultActiveTabId ?? genId(), label: "Sheet1" },
      ],
  );
  const tabs = isTabsControlled ? tabsProp! : uncontrolledTabs;

  const commitTabs = React.useCallback(
    (next: DynamicTabItem[]) => {
      if (!isTabsControlled) setUncontrolledTabs(next);
      onTabsChange?.(next);
    },
    [isTabsControlled, onTabsChange],
  );

  // -- Active id state (controlled / uncontrolled) --
  const isActiveControlled = activeTabId !== undefined;
  const [uncontrolledActive, setUncontrolledActive] = React.useState<
    string | undefined
  >(defaultActiveTabId ?? tabs[0]?.id);
  const activeId = isActiveControlled ? activeTabId : uncontrolledActive;

  const setActive = React.useCallback(
    (id: string) => {
      if (!isActiveControlled) setUncontrolledActive(id);
      onActiveTabChange?.(id);
    },
    [isActiveControlled, onActiveTabChange],
  );

  // -- Rename state --
  const [renameId, setRenameId] = React.useState<string | null>(null);
  const startRename = React.useCallback((id: string) => setRenameId(id), []);
  const cancelRename = React.useCallback(() => setRenameId(null), []);
  const commitRename = React.useCallback(
    (id: string, label: string) => {
      setRenameId(null);
      const trimmed = label.trim();
      if (!trimmed) return;
      const current = tabs.find((t) => t.id === id);
      if (!current || current.label === trimmed) return;
      commitTabs(tabs.map((t) => (t.id === id ? { ...t, label: trimmed } : t)));
      onRename?.(id, trimmed);
    },
    [tabs, commitTabs, onRename],
  );

  // -- Pending delete (drives AlertDialog) --
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

  const removeTab = React.useCallback(
    (id: string) => {
      if (tabs.length <= 1) return;
      const idx = tabs.findIndex((t) => t.id === id);
      if (idx === -1) return;
      const next = tabs.filter((t) => t.id !== id);
      commitTabs(next);
      if (activeId === id) {
        const fallback = next[idx] ?? next[idx - 1] ?? next[0];
        if (fallback) setActive(fallback.id);
      }
      onDelete?.(id);
    },
    [tabs, commitTabs, activeId, setActive, onDelete],
  );

  const requestDelete = React.useCallback(
    (id: string) => {
      const tab = tabs.find((t) => t.id === id);
      if (!tab || tab.closable === false || tabs.length <= 1) return;
      if (confirmDelete) {
        setPendingDeleteId(id);
      } else {
        removeTab(id);
      }
    },
    [tabs, confirmDelete, removeTab],
  );

  // -- Add --
  const addTab = React.useCallback(async () => {
    let next: DynamicTabItem;
    if (onAdd) {
      next = await onAdd();
    } else {
      next = { id: genId(), label: nextSheetLabel(tabs) };
    }
    const newTabs = [...tabs, next];
    commitTabs(newTabs);
    setActive(next.id);
    if (next.renamable !== false) {
      // Defer so the new trigger has mounted by the time we flip to rename mode.
      setTimeout(() => setRenameId(next.id), 0);
    }
  }, [onAdd, tabs, commitTabs, setActive]);

  // -- Duplicate --
  const duplicateTab = React.useCallback(
    (id: string) => {
      const idx = tabs.findIndex((t) => t.id === id);
      const src = tabs[idx];
      if (!src) return;
      const clone: DynamicTabItem = {
        ...src,
        id: genId(),
        label: `${src.label} (copy)`,
      };
      const next = [...tabs.slice(0, idx + 1), clone, ...tabs.slice(idx + 1)];
      commitTabs(next);
      setActive(clone.id);
      onDuplicate?.(id);
    },
    [tabs, commitTabs, setActive, onDuplicate],
  );

  // -- Color --
  const setTabColor = React.useCallback(
    (id: string, color: DynamicTabColor) => {
      commitTabs(tabs.map((t) => (t.id === id ? { ...t, color } : t)));
      onColorChange?.(id, color);
    },
    [tabs, commitTabs, onColorChange],
  );

  // -- Reorder --
  const reorder = React.useCallback(
    (fromId: string, toId: string) => {
      const fromIdx = tabs.findIndex((t) => t.id === fromId);
      const toIdx = tabs.findIndex((t) => t.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      commitTabs(arrayMove(tabs, fromIdx, toIdx));
    },
    [tabs, commitTabs],
  );

  // -- dnd-kit --
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      reorder(String(active.id), String(over.id));
    },
    [reorder],
  );

  const ctxValue = React.useMemo<DynamicTabContextValue>(
    () => ({
      tabs,
      activeId,
      position,
      reorderable,
      addable,
      renameId,
      setActive,
      addTab: () => void addTab(),
      startRename,
      commitRename,
      cancelRename,
      requestDelete,
      duplicateTab,
      setTabColor,
      reorder,
    }),
    [
      tabs,
      activeId,
      position,
      reorderable,
      addable,
      renameId,
      setActive,
      addTab,
      startRename,
      commitRename,
      cancelRename,
      requestDelete,
      duplicateTab,
      setTabColor,
      reorder,
    ],
  );

  const tabIds = React.useMemo(() => tabs.map((t) => t.id), [tabs]);

  const strip = (
    <TabStrip
      sensors={sensors}
      tabIds={tabIds}
      onDragEnd={handleDragEnd}
      addLabel={addLabel}
    />
  );

  const pendingDeleteTab = pendingDeleteId
    ? tabs.find((t) => t.id === pendingDeleteId) ?? null
    : null;

  return (
    <DynamicTabContext.Provider value={ctxValue}>
      <TabsPrimitive.Root
        data-slot="dynamic-tab"
        data-position={position}
        value={activeId}
        onValueChange={setActive}
        className={cn("flex h-full w-full flex-col", className)}
      >
        {position === "top" && strip}
        <div
          data-slot="dynamic-tab-content"
          className="min-h-0 flex-1 overflow-auto"
        >
          {children}
        </div>
        {position === "bottom" && strip}
      </TabsPrimitive.Root>

      <AlertDialog
        open={pendingDeleteTab !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteTab && deleteConfirmDescription
                ? deleteConfirmDescription(pendingDeleteTab)
                : pendingDeleteTab
                  ? `"${pendingDeleteTab.label}" and its contents will be removed. This can't be undone.`
                  : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{deleteConfirmCancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteId) removeTab(pendingDeleteId);
                setPendingDeleteId(null);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteConfirmActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DynamicTabContext.Provider>
  );
}

function TabStrip({
  sensors,
  tabIds,
  onDragEnd,
  addLabel,
}: {
  sensors: ReturnType<typeof useSensors>;
  tabIds: string[];
  onDragEnd: (event: DragEndEvent) => void;
  addLabel: string;
}) {
  const ctx = React.useContext(DynamicTabContext);
  if (!ctx) throw new Error("TabStrip must be rendered inside <DynamicTab>");

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = React.useState({ left: false, right: false });

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const measure = () => {
      const left = el.scrollLeft > 0;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setOverflow((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right },
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [tabIds.length]);

  const scrollBy = React.useCallback((dir: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.max(120, el.clientWidth * 0.6),
      behavior: "smooth",
    });
  }, []);

  const hasOverflow = overflow.left || overflow.right;

  return (
    <div
      data-slot="dynamic-tab-strip"
      data-position={ctx.position}
      className={dynamicTabStripVariants({ position: ctx.position })}
    >
      {hasOverflow && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-slot="dynamic-tab-scroll-left"
          aria-label="Scroll tabs left"
          disabled={!overflow.left}
          onClick={() => scrollBy(-1)}
          className="shrink-0"
        >
          <ChevronLeft />
        </Button>
      )}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
          <TabsPrimitive.List
            ref={listRef}
            data-slot="dynamic-tab-list"
            className="flex h-full flex-1 items-stretch gap-px overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {ctx.tabs.map((tab) => (
              <SortableTab key={tab.id} tab={tab} />
            ))}
          </TabsPrimitive.List>
        </SortableContext>
      </DndContext>

      {hasOverflow && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-slot="dynamic-tab-scroll-right"
          aria-label="Scroll tabs right"
          disabled={!overflow.right}
          onClick={() => scrollBy(1)}
          className="shrink-0"
        >
          <ChevronRight />
        </Button>
      )}

      {ctx.addable && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-slot="dynamic-tab-add"
          aria-label={addLabel}
          onClick={ctx.addTab}
          className="shrink-0"
        >
          <Plus />
        </Button>
      )}
    </div>
  );
}

export function DynamicTabPanel({
  tabId,
  className,
  children,
}: DynamicTabPanelProps) {
  return (
    <TabsPrimitive.Content
      data-slot="dynamic-tab-panel"
      value={tabId}
      className={cn(
        "outline-none data-[state=inactive]:hidden",
        className,
      )}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
