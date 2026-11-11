import {z} from 'zod';

import type {RawReportData} from './types';

// Structure only: the pages need these containers to exist. Every leaf is
// read tolerantly by readReport.ts, so a missing field shows "Not reported"
// instead of failing the page.
const reportShape = z
  .object({
    meta: z.object({}).passthrough(),
    national: z.object({}).passthrough(),
    states: z.array(
      z.object({postal: z.string(), name: z.string()}).passthrough(),
    ),
  })
  .passthrough();

export type ShapeResult =
  | {success: true; data: RawReportData}
  | {success: false; paths: string[]};

/** Checks the report's structure. Returns the failing paths when it doesn't match. */
export function checkReportShape(value: unknown): ShapeResult {
  const result = reportShape.safeParse(value);

  if (result.success) {
    return {success: true, data: result.data as RawReportData};
  }

  return {
    success: false,
    paths: result.error.issues.map(issue => issue.path.join('.') || '(root)'),
  };
}
