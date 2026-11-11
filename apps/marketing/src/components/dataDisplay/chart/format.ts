/** A serializable number format, so server components can pass it to chart islands. */
export interface ValueFormat {
  digits?: number;
  suffix?: string;
}

export const formatValue = (value: number, format: ValueFormat = {}) =>
  `${value.toFixed(format.digits ?? 1)}${format.suffix ?? ''}`;
