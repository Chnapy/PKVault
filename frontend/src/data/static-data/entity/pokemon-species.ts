import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import { arrayToRecord } from "../../../util/array-to-record";
import {
  getOrFetchPokemonSpeciesDataAll,
  type PokemonSpecies,
  type PokemonSpeciesDb,
} from "../pokeapi/pokemon-species";

export type PokemonSpeciesStatic = Pick<
  PokemonSpecies,
  "id" | "name" | "names" | "flavor_text_entries" | "generation"
>;

export type PokemonSpeciesDbStatic = PokemonSpeciesDb<PokemonSpeciesStatic>;

export const loadPokemonSpeciesData = async (db: {
  pokemonSpecies: EntityTable<PokemonSpeciesStatic, "id">;
}) => {
  const data = await getOrFetchPokemonSpeciesDataAll({
    db,
    pickFn: (data) =>
      pick(data, [
        "id",
        "name",
        "names",
        "flavor_text_entries",
        "generation",
      ]) satisfies PokemonSpeciesStatic,
  });

  return arrayToRecord(data, "id");
};
