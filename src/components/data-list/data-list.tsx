import * as React from "react";
import { cn } from "../../lib/cn";
import {
  dataListItemVariants,
  dataListLabelVariants,
  dataListValueVariants,
  dataListVariants,
  type DataListVariants,
} from "./data-list.variants";

const DEFAULT_LABEL_WIDTH = "10rem";

export type DataListOrientation = "horizontal" | "vertical";

type DataListContextValue = {
  orientation: DataListOrientation;
  size: NonNullable<DataListVariants["size"]>;
  dense: boolean;
};

const DataListContext = React.createContext<DataListContextValue>({
  orientation: "horizontal",
  size: "default",
  dense: false,
});

function useDataListContext(): DataListContextValue {
  return React.useContext(DataListContext);
}

export type DataListRootProps = Omit<React.ComponentProps<"dl">, "size"> & {
  orientation?: DataListOrientation;
  size?: DataListVariants["size"];
  /** Tighter rows, for a panel that has to fit a lot of fields. */
  dense?: boolean;
  /**
   * Width of the label column, any CSS length. One width for the whole list is
   * the point: it is what gives every value a common left edge.
   */
  labelWidth?: string;
};

function DataListRoot({
  orientation = "horizontal",
  size = "default",
  dense = false,
  labelWidth = DEFAULT_LABEL_WIDTH,
  className,
  style,
  children,
  ...props
}: DataListRootProps) {
  const ctx = React.useMemo<DataListContextValue>(
    () => ({ orientation, size: size ?? "default", dense }),
    [orientation, size, dense],
  );

  return (
    <DataListContext.Provider value={ctx}>
      <dl
        data-slot="data-list"
        data-orientation={orientation}
        data-size={size}
        data-dense={dense || undefined}
        style={
          {
            ...style,
            "--data-list-label-width": labelWidth,
          } as React.CSSProperties
        }
        className={cn(dataListVariants({ size, dense }), className)}
        {...props}
      >
        {children}
      </dl>
    </DataListContext.Provider>
  );
}
DataListRoot.displayName = "DataList.Root";

export type DataListItemProps = React.ComponentProps<"div">;

function DataListItem({ className, ...props }: DataListItemProps) {
  const { orientation, dense } = useDataListContext();
  return (
    <div
      data-slot="data-list-item"
      className={cn(dataListItemVariants({ orientation, dense }), className)}
      {...props}
    />
  );
}
DataListItem.displayName = "DataList.Item";

export type DataListLabelProps = React.ComponentProps<"dt">;

function DataListLabel({ className, ...props }: DataListLabelProps) {
  const { orientation, size } = useDataListContext();
  return (
    <dt
      data-slot="data-list-label"
      className={cn(dataListLabelVariants({ orientation, size }), className)}
      {...props}
    />
  );
}
DataListLabel.displayName = "DataList.Label";

export type DataListValueProps = React.ComponentProps<"dd">;

function DataListValue({ className, ...props }: DataListValueProps) {
  const { size } = useDataListContext();
  return (
    <dd
      data-slot="data-list-value"
      className={cn(dataListValueVariants({ size }), className)}
      {...props}
    />
  );
}
DataListValue.displayName = "DataList.Value";

export type DataListField = {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Needed only when two rows would otherwise share a label. */
  key?: string;
};

export type DataListProps = DataListRootProps & {
  items: DataListField[];
};

/**
 * The label/value block on a record's detail view.
 *
 * `items` covers the ordinary case; the `DataList*` parts underneath are there
 * for a row that needs to do something the shape does not allow — span both
 * columns, group under a heading, carry its own action.
 */
function DataList({ items, ...rootProps }: DataListProps) {
  // An empty `<dl>` is markup a screen reader still walks into and announces
  // as a list of zero items. Nothing is the honest rendering; a caller with
  // nothing to show wants `<EmptyState />`, not an empty frame.
  if (items.length === 0) return null;

  return (
    <DataListRoot {...rootProps}>
      {items.map((field, index) => (
        <DataListItem key={field.key ?? index}>
          <DataListLabel>{field.label}</DataListLabel>
          <DataListValue>{field.value}</DataListValue>
        </DataListItem>
      ))}
    </DataListRoot>
  );
}
DataList.displayName = "DataList";

export { DataList, DataListRoot, DataListItem, DataListLabel, DataListValue };
