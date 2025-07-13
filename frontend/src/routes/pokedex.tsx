import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { FiltersCard } from "../components/filters/filters-card";
import { PokedexDetails } from "../pokedex/details/pokedex-details";
import { FilterContext } from "../pokedex/filters/filter-context";
import { PokedexList } from "../pokedex/list/pokedex-list";
import z from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

export const PokedexPage: React.FC = () => {
  return (
    <FilterContext.Provider>
      <div>
        <div>
          <div style={{ paddingBottom: 8 }}>
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
    </FilterContext.Provider>
  );
};

const searchSchema = z.object({
  selected: z.number().optional(),
  filters: z
    .object({
      speciesName: z.string().optional(),
      types: z.array(z.string()).optional(),
      seen: z.boolean().optional(),
      caught: z.boolean().optional(),
      fromGames: z.array(z.number()).optional(), // saveIDs
      generations: z.array(z.string()).optional(), // generation.name
    })
    .default({}),
  // sort: z.enum(['newest', 'oldest', 'price']).default('newest'),
});

export const Route = createFileRoute("/pokedex")({
  component: PokedexPage,
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [
      ({ search, next }) => {
        const result = next(search);

        return {
          ...search,
          ...result,
          filters: {
            ...search.filters,
            ...result.filters,
          },
        };
      },
    ],
  },
});
