import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import { getOrFetchMoveDataAll, type Move, type MoveDb } from "../pokeapi/move";

export type MoveStatic = Pick<Move, "id" | "name" | "names">;

export type MoveDbStatic = MoveDb<MoveStatic>;

export const loadMoveData = async (db: {
  move: EntityTable<MoveStatic, "id">;
}) => {
  const data = await getOrFetchMoveDataAll({
    db,
    pickFn: (data) => pick(data, [ "id", "name", "names" ]) satisfies MoveStatic,
  });

  return data;
};
