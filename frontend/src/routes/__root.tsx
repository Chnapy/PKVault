import { createRootRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import z from 'zod';
import { RootPage } from '../pages/__root';

const searchSchema = z.object({
  // /docs/{lang}/file.md#section
  help: z.string().optional(),
});

export const Route = createRootRoute({
  component: RootPage,
  validateSearch: zodValidator(fallback(searchSchema, {})),
});
