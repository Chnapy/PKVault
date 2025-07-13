import Dexie, { type DexieOptions, type EntityTable } from "dexie";
import { type ItemDb, itemStore } from "../static-data/pokeapi/item";
import { type PokemonDb, pokemonStore } from "../static-data/pokeapi/pokemon";
import {
  type PokemonSpeciesDb,
  pokemonSpeciesStore,
} from "../static-data/pokeapi/pokemon-species";
import { type TypeDb, typeStore } from "../static-data/pokeapi/type";

export const createDB = (options: DexieOptions) => {
  const db = new Dexie("pokeapi", options) as Dexie & {
    _table_full: EntityTable<{ tableName: string }, "tableName">;
  } & PokemonSpeciesDb &
    PokemonDb &
    TypeDb &
    ItemDb;

  // Schema declaration:
  db.version(1).stores({
    _table_full: "++tableName",

    ...pokemonSpeciesStore,
    ...pokemonStore,
    ...typeStore,
    ...itemStore,
  });

  return db;
};

export const db = createDB({ cache: "disabled" });
