import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { StoragePage } from '../pages/storage';

export type StorageSearchSchema = z.infer<typeof searchSchema>;

export type StorageSearchStorage = NonNullable<StorageSearchSchema[ 'storages' ]>[ number ];
export type StorageSearchSelected = NonNullable<StorageSearchSchema[ 'selected' ]>;

export type DetailsExpandedState = 'none' | 'expanded';

const searchSchema = z.object({
  selected: z
    .object({
      storage: z.number(),
      saveId: z.number().int().optional(),
      id: z.string(),
    })
    .optional(),
  selectedContext: z.number().optional(),
  selectExpanded: z.enum([ 'none', 'expanded' ] as const satisfies DetailsExpandedState[]).optional(),
  storages: z.array(z
    .object({
      saveId: z.number().int().nullable(),
      boxId: z.number().int().optional(),
    })
  ).max(2).optional(),
});

export const Route = createFileRoute("/storage")({
  component: StoragePage,
  validateSearch: zodValidator(fallback(searchSchema, {})),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});
