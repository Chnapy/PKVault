import Dexie, { type DexieOptions } from "dexie";
import { loadAbilityData, type AbilityDbStatic } from './entity/ability';
import {
  loadGenerationData,
  type GenerationDbStatic,
} from "./entity/generation";
import { loadItemData, type ItemDbStatic } from "./entity/item";
import { loadPokemonData, type PokemonDbStatic } from "./entity/pokemon";
import {
  loadPokemonSpeciesData,
  type PokemonSpeciesDbStatic,
} from "./entity/pokemon-species";
import { loadTypeData, type TypeDbStatic } from "./entity/type";
import { abilityStore } from './pokeapi/ability';
import { generationStore } from "./pokeapi/generation";
import { itemStore } from "./pokeapi/item";
import { pokemonStore } from "./pokeapi/pokemon";
import { pokemonSpeciesStore } from "./pokeapi/pokemon-species";
import { typeStore } from "./pokeapi/type";

export const createDB = (options: DexieOptions) => {
  const db = new Dexie("pokeapi", options) as Dexie &
    PokemonSpeciesDbStatic &
    PokemonDbStatic &
    TypeDbStatic &
    ItemDbStatic &
    GenerationDbStatic &
    AbilityDbStatic;

  db.version(1).stores({
    ...pokemonSpeciesStore,
    ...pokemonStore,
    ...typeStore,
    ...itemStore,
    ...generationStore,
    ...abilityStore,
  });

  return db;
};

export const db = createDB({ cache: "disabled" });

export const loadStaticData = async () => {
  return {
    pokemonSpecies: await loadPokemonSpeciesData(db),
    pokemon: await loadPokemonData(db),
    type: await loadTypeData(db),
    item: await loadItemData(db),
    generation: await loadGenerationData(db),
    ability: await loadAbilityData(db),
  } satisfies Record<keyof Omit<typeof db, keyof Dexie>, unknown>;
};
