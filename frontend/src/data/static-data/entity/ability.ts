import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import { getOrFetchAbilityDataAll, type Ability, type AbilityDb } from "../pokeapi/ability";

export type AbilityStatic = Pick<Ability, "id" | "name" | "names">;

export type AbilityDbStatic = AbilityDb<AbilityStatic>;

export const loadAbilityData = async (db: {
  ability: EntityTable<AbilityStatic, "id">;
}) => {
  const data = await getOrFetchAbilityDataAll({
    db,
    pickFn: (data) => pick(data, [ "id", "name", "names" ]) satisfies AbilityStatic,
  });

  return data;
};
