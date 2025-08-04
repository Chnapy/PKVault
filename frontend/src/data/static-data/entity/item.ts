import { pick } from "@tanstack/react-router";
import type { EntityTable } from "dexie";
import {
  getOrFetchItemDataItem,
  type Item,
  type ItemDb,
} from "../pokeapi/item";
import { getOrFetchItemCategoryDataItem, type ItemCategory, type ItemCategoryDb } from '../pokeapi/item-category';

export type ItemCategoryStatic = Pick<ItemCategory, "id" | "items">;

export type ItemStatic = Pick<Item, "id" | "name" | "names" | "sprites">;

export type ItemCategoryDbStatic = ItemCategoryDb<ItemCategoryStatic>;

export type ItemDbStatic = ItemDb<ItemStatic>;

export const loadItemData = async (db: {
  itemCategory: EntityTable<ItemCategoryStatic, "id">;
  item: EntityTable<ItemStatic, "id">;
}) => {
  const ballCategories = await Promise.all([ 33, 34 ].map(id => getOrFetchItemCategoryDataItem(id, {
    db,
    pickFn: (data) => pick(data, [ "id", "items" ]) satisfies ItemCategoryStatic,
  })));

  const balls = await Promise.all(
    ballCategories.flatMap(category => category.items.map(item => {
      const id = item.url.substr(0, item.url.length - 1).split('/').pop()!;

      return getOrFetchItemDataItem(+id, {
        db,
        pickFn: (data) => pick(data, [ "id", 'name', 'names', "sprites" ]) satisfies ItemStatic,
      });
    }))
  );

  const pkball = balls.find(ball => ball.id === 4)!;

  return {
    balls,
    pkball,
  };
};
