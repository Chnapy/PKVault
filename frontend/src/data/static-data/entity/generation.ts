import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import {
  getOrFetchGenerationDataAll,
  type Generation,
  type GenerationDb,
} from "../pokeapi/generation";

export type GenerationStatic = Pick<Generation, "id" | "name" | "names">;

export type GenerationDbStatic = GenerationDb<GenerationStatic>;

export const loadGenerationData = async (db: {
  generation: EntityTable<GenerationStatic, "id">;
}) => {
  const data = await getOrFetchGenerationDataAll({
    db,
    pickFn: (data) =>
      pick(data, ["id", "name", "names"]) satisfies GenerationStatic,
  });

  return data;
};
