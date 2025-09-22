import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import z from "zod";
import { PokedexDetails } from "../pokedex/details/pokedex-details";
import { FiltersCard } from "../pokedex/filters/filters-card";
import { PokedexList } from "../pokedex/list/pokedex-list";

export const PokedexPage: React.FC = () => {
  return (
    <div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 8,
          }}
        >
          <FiltersCard />
        </div>

        <PokedexList />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 350,
        }}
      >
        <PokedexDetails />
      </div>
    </div>
  );
};

const searchSchema = z.object({
  selected: z.number().optional(),
  filterSpeciesName: z.string().optional(),
  filterTypes: z.array(z.number()).optional(),
  filterSeen: z.boolean().optional(),
  filterCaught: z.boolean().optional(),
  filterOwned: z.boolean().optional(),
  filterOwnedShiny: z.boolean().optional(),
  filterFromGames: z.array(z.number()).optional(), // saveIDs
  filterGenerations: z.array(z.number()).optional(), // generation.name
  // sort: z.enum(['newest', 'oldest', 'price']).default('newest'),
});

export const Route = createFileRoute("/pokedex")({
  component: PokedexPage,
  validateSearch: zodValidator(fallback(searchSchema, {})),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});
