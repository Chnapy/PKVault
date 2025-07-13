import Dexie, { type DexieOptions, type EntityTable } from "dexie";
import { itemStore, type ItemDb } from "../pokeapi/modules/v2/item";
import { pokemonStore, type PokemonDb } from "../pokeapi/modules/v2/pokemon";
import {
  pokemonSpeciesStore,
  type PokemonSpeciesDb,
} from "../pokeapi/modules/v2/pokemon-species";
import { typeStore, type TypeDb } from "../pokeapi/modules/v2/type";

export const pick = <O, K extends keyof O>(obj: O, keys: K[]) =>
  Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<O, K>;

export const arrayToRecord = <V, K extends keyof V>(arr: V[], key: K) =>
  Object.fromEntries(arr.map((value) => [value[key], value])) as Record<
    Extract<V[K], string | number>,
    V
  >;

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
