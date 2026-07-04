import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { PokedexPage } from '../pages/pokedex';
import type { DetailsExpandedState } from './storage';

const searchSchema = z.object({
  selected: z.number().optional(),
  selectedSaveId: z.number().optional(),
  selectExpanded: z.enum([ 'none', 'expanded' ] as const satisfies DetailsExpandedState[]).optional(),
  filterSpeciesName: z.string().optional(),
  filterTypes: z.array(z.number()).optional(),
  filterSeen: z.boolean().optional(),
  filterCaught: z.boolean().optional(),
  filterOwned: z.boolean().optional(),
  filterOwnedShiny: z.boolean().optional(),
  filterFromGames: z.array(z.number()).optional(), // saveIDs
  filterGenerations: z.array(z.number()).optional(), // generation.name
  showForms: z.boolean().optional(),
  showGenders: z.boolean().optional(),
});

export const Route = createFileRoute("/pokedex")({
  component: PokedexPage,
  validateSearch: zodValidator(fallback(searchSchema, {})),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});
