import Dexie, { type DexieOptions } from "dexie";
import { loadAbilityData, type AbilityDbStatic } from './entity/ability';
import {
  loadGenerationData,
  type GenerationDbStatic,
} from "./entity/generation";
import { loadItemData, type ItemCategoryDbStatic, type ItemDbStatic } from "./entity/item";
import { loadMoveData, type MoveDbStatic } from './entity/move';
import { loadNatureData, type NatureDbStatic } from './entity/nature';
import { loadPokemonData, type PokemonDbStatic } from "./entity/pokemon";
import {
  loadPokemonSpeciesData,
  type PokemonSpeciesDbStatic,
} from "./entity/pokemon-species";
import { loadTypeData, type TypeDbStatic } from "./entity/type";
import { abilityStore } from './pokeapi/ability';
import { generationStore } from "./pokeapi/generation";
import { itemStore } from "./pokeapi/item";
import { itemCategoryStore } from './pokeapi/item-category';
import { moveStore } from './pokeapi/move';
import { natureStore } from './pokeapi/nature';
import { pokemonStore } from "./pokeapi/pokemon";
import { pokemonSpeciesStore } from "./pokeapi/pokemon-species";
import { typeStore } from "./pokeapi/type";

export const createDB = (options: DexieOptions) => {
  const db = new Dexie("pokeapi", options) as Dexie &
    PokemonSpeciesDbStatic &
    PokemonDbStatic &
    TypeDbStatic &
    ItemDbStatic &
    ItemCategoryDbStatic &
    GenerationDbStatic &
    AbilityDbStatic &
    MoveDbStatic &
    NatureDbStatic;

  db.version(1).stores({
    ...pokemonSpeciesStore,
    ...pokemonStore,
    ...typeStore,
    ...itemStore,
    ...itemCategoryStore,
    ...generationStore,
    ...abilityStore,
    ...moveStore,
    ...natureStore,
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
    move: await loadMoveData(db),
    nature: await loadNatureData(db),
  };
};
