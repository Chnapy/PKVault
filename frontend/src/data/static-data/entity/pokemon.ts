import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import { arrayToRecord } from "../../../util/array-to-record";
import {
  getOrFetchPokemonDataAll,
  type Pokemon,
  type PokemonDb,
} from "../pokeapi/pokemon";

export type PokemonStatic = Pick<Pokemon, "id" | "types" | "sprites">;

export type PokemonDbStatic = PokemonDb<PokemonStatic>;

export const loadPokemonData = async (db: {
  pokemon: EntityTable<PokemonStatic, "id">;
}) => {
  const data = await getOrFetchPokemonDataAll({
    db,
    pickFn: (data) =>
      pick(data, ["id", "types", "sprites"]) satisfies PokemonStatic,
  });

  return arrayToRecord(data, "id");
};
