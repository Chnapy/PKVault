import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import React from "react";
import { FiltersCard } from "../pokedex/filters/filters-card";
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
    </FilterContext.Provider>
  );
};

const searchSchema = z.object({
  selected: z.number().optional(),
  filterSpeciesName: z.string().optional(),
  filterTypes: z.array(z.string()).optional(),
  filterSeen: z.boolean().optional(),
  filterCaught: z.boolean().optional(),
  filterFromGames: z.array(z.number()).optional(), // saveIDs
  filterGenerations: z.array(z.number()).optional(), // generation.name
  // sort: z.enum(['newest', 'oldest', 'price']).default('newest'),
});

export const Route = createFileRoute("/pokedex")({
  component: PokedexPage,
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});
