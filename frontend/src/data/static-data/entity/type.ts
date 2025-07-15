import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import { getOrFetchTypeDataAll, type Type, type TypeDb } from "../pokeapi/type";

export type TypeStatic = Pick<Type, "id" | "name" | "names">;

export type TypeDbStatic = TypeDb<TypeStatic>;

export const loadTypeData = async (db: {
  type: EntityTable<TypeStatic, "id">;
}) => {
  const data = await getOrFetchTypeDataAll({
    db,
    pickFn: (data) => pick(data, ["id", "name", "names"]) satisfies TypeStatic,
  });

  return data;
};
