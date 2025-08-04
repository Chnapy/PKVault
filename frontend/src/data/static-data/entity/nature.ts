import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import { getOrFetchNatureDataAll, type Nature, type NatureDb } from "../pokeapi/nature";

export type NatureStatic = Pick<Nature, "id" | "name" | "names">;

export type NatureDbStatic = NatureDb<NatureStatic>;

export const loadNatureData = async (db: {
  nature: EntityTable<NatureStatic, "id">;
}) => {
  const data = await getOrFetchNatureDataAll({
    db,
    pickFn: (data) => pick(data, [ "id", "name", "names" ]) satisfies NatureStatic,
  });

  return data;
};
