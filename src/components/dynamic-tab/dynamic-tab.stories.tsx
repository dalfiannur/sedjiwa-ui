import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DynamicTab, DynamicTabPanel } from "./dynamic-tab";
import type { DynamicTabItem } from "./dynamic-tab.types";

const meta = {
  title: "Components/DynamicTab",
  component: DynamicTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    position: {
      control: "inline-radio",
      options: ["top", "bottom"],
    },
    addable: { control: "boolean" },
    reorderable: { control: "boolean" },
    confirmDelete: { control: "boolean" },
  },
  args: {
    position: "bottom",
    addable: true,
    reorderable: true,
    confirmDelete: true,
  },
} satisfies Meta<typeof DynamicTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const STARTER_TABS: DynamicTabItem[] = [
  { id: "sheet-1", label: "Sheet1" },
  { id: "sheet-2", label: "Sheet2" },
  { id: "sheet-3", label: "Sheet3" },
];

function PanelStub({ title }: { title: string }) {
  return (
    <div className="grid h-full place-items-center bg-background text-muted-foreground">
      <div className="text-center">
        <div className="text-3xl font-semibold text-foreground">{title}</div>
        <div className="mt-2 text-sm">Right-click a tab for actions. Double-click to rename.</div>
      </div>
    </div>
  );
}

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="h-[400px] w-full overflow-hidden rounded-lg border bg-muted/20">
    {children}
  </div>
);

export const Default: Story = {
  render: (args) => (
    <Frame>
      <DynamicTab {...args} defaultTabs={STARTER_TABS} defaultActiveTabId="sheet-1">
        {STARTER_TABS.map((t) => (
          <DynamicTabPanel key={t.id} tabId={t.id}>
            <PanelStub title={t.label} />
          </DynamicTabPanel>
        ))}
      </DynamicTab>
    </Frame>
  ),
};

export const TopPosition: Story = {
  args: { position: "top" },
  render: (args) => (
    <Frame>
      <DynamicTab {...args} defaultTabs={STARTER_TABS} defaultActiveTabId="sheet-1">
        {STARTER_TABS.map((t) => (
          <DynamicTabPanel key={t.id} tabId={t.id}>
            <PanelStub title={t.label} />
          </DynamicTabPanel>
        ))}
      </DynamicTab>
    </Frame>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [tabs, setTabs] = useState<DynamicTabItem[]>(STARTER_TABS);
    const [activeId, setActiveId] = useState<string>("sheet-1");
    return (
      <div className="flex h-[400px] w-full gap-4">
        <Frame>
          <DynamicTab
            {...args}
            tabs={tabs}
            onTabsChange={setTabs}
            activeTabId={activeId}
            onActiveTabChange={setActiveId}
          >
            {tabs.map((t) => (
              <DynamicTabPanel key={t.id} tabId={t.id}>
                <PanelStub title={t.label} />
              </DynamicTabPanel>
            ))}
          </DynamicTab>
        </Frame>
        <aside className="w-64 shrink-0 rounded-lg border bg-card p-3 text-sm">
          <div className="font-medium">Parent state</div>
          <div className="mt-2 text-xs text-muted-foreground">active: {activeId}</div>
          <ul className="mt-2 space-y-1">
            {tabs.map((t) => (
              <li
                key={t.id}
                className={`rounded px-2 py-1 ${t.id === activeId ? "bg-accent" : ""}`}
              >
                {t.label}
                {t.color && t.color !== "default" && (
                  <span className="ml-2 text-xs text-muted-foreground">({t.color})</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    );
  },
};

export const WithColors: Story = {
  render: (args) => {
    const colored: DynamicTabItem[] = [
      { id: "a", label: "Forecast", color: "blue" },
      { id: "b", label: "Actuals", color: "green" },
      { id: "c", label: "Variance", color: "red" },
      { id: "d", label: "Notes", color: "yellow" },
    ];
    return (
      <Frame>
        <DynamicTab {...args} defaultTabs={colored} defaultActiveTabId="a">
          {colored.map((t) => (
            <DynamicTabPanel key={t.id} tabId={t.id}>
              <PanelStub title={t.label} />
            </DynamicTabPanel>
          ))}
        </DynamicTab>
      </Frame>
    );
  },
};

export const LongTabList: Story = {
  render: (args) => {
    const many: DynamicTabItem[] = Array.from({ length: 24 }, (_, i) => ({
      id: `m-${i}`,
      label: `Sheet${i + 1}`,
    }));
    return (
      <Frame>
        <DynamicTab {...args} defaultTabs={many} defaultActiveTabId="m-0">
          {many.map((t) => (
            <DynamicTabPanel key={t.id} tabId={t.id}>
              <PanelStub title={t.label} />
            </DynamicTabPanel>
          ))}
        </DynamicTab>
      </Frame>
    );
  },
};

export const NoConfirmDelete: Story = {
  args: { confirmDelete: false },
  render: (args) => (
    <Frame>
      <DynamicTab {...args} defaultTabs={STARTER_TABS} defaultActiveTabId="sheet-1">
        {STARTER_TABS.map((t) => (
          <DynamicTabPanel key={t.id} tabId={t.id}>
            <PanelStub title={t.label} />
          </DynamicTabPanel>
        ))}
      </DynamicTab>
    </Frame>
  ),
};

export const FrozenLayout: Story = {
  args: { addable: false, reorderable: false },
  render: (args) => (
    <Frame>
      <DynamicTab {...args} defaultTabs={STARTER_TABS} defaultActiveTabId="sheet-1">
        {STARTER_TABS.map((t) => (
          <DynamicTabPanel key={t.id} tabId={t.id}>
            <PanelStub title={t.label} />
          </DynamicTabPanel>
        ))}
      </DynamicTab>
    </Frame>
  ),
};

export const AsyncOnAdd: Story = {
  render: (args) => (
    <Frame>
      <DynamicTab
        {...args}
        defaultTabs={STARTER_TABS}
        defaultActiveTabId="sheet-1"
        onAdd={async () => {
          // Simulate a server round-trip that returns a server-assigned id.
          await new Promise((r) => setTimeout(r, 400));
          return {
            id: `server-${Math.random().toString(36).slice(2, 8)}`,
            label: "New sheet",
          };
        }}
      >
        {STARTER_TABS.map((t) => (
          <DynamicTabPanel key={t.id} tabId={t.id}>
            <PanelStub title={t.label} />
          </DynamicTabPanel>
        ))}
      </DynamicTab>
    </Frame>
  ),
};
