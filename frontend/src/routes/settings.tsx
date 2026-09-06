import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import z from "zod";
import { SettingsPage } from '../pages/settings';

export type StorageSearchSchema = z.infer<typeof searchSchema>;

export type SettingsSubMenuValue = 'main' | 'external-pkms' | 'backups' | 'about';

const searchSchema = z.object({
  subMenu: z.enum([ 'main', 'external-pkms', 'backups', 'about' ] as const satisfies SettingsSubMenuValue[]).optional(),
});

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  validateSearch: fallback(searchSchema, {
    subMenu: undefined,
  }),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});
