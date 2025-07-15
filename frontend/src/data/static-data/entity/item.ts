import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import {
  getOrFetchItemDataItem,
  type Item,
  type ItemDb,
} from "../pokeapi/item";

export type ItemStatic = Pick<Item, "id" | "sprites">;

export type ItemDbStatic = ItemDb<ItemStatic>;

export const loadItemData = async (db: {
  item: EntityTable<ItemStatic, "id">;
}) => {
  const pkball = await getOrFetchItemDataItem(4, {
    db,
    pickFn: (data) => pick(data, ["id", "sprites"]) satisfies ItemStatic,
  });

  return {
    pkball,
  };
};
