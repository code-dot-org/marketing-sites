export interface RemoveMarginBottomProps {
  /** Whether to remove the margin bottom */
  removeMarginBottom: boolean;
}

// Generic interface to extend components with the `removeMarginBottom` prop.
export type WithRemoveMarginBottomProp<T extends object> = T &
  RemoveMarginBottomProps;
