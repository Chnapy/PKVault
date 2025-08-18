#!/bin/node

import fs from "node:fs";
import path from "node:path";
import { compile } from "json-schema-to-typescript";
import convertCase from "js-convert-case";
import prettier from "prettier";

const rootDir = path.resolve("public");
const rootDataDir = path.join(rootDir, "pokeapi/data");

const schemaDir = path.join(rootDataDir, "schema/v2");
const dataDir = path.join(rootDataDir, "api/v2");
const modulesDir = path.join("src/data/static-data/pokeapi");

type ProcessItem = {
  type: "list" | "item" | "item-child" | "config" | "unknown";
  schemaPath: string;
  dataPath: string;
};

const readJSON = (pat: string) =>
  JSON.parse(fs.readFileSync(pat, "utf8")) as { id: number };

const process = (schemaPath: string, dataPath: string): ProcessItem[] => {
  if (fs.statSync(schemaPath).isDirectory()) {
    const schemaDirList = fs.readdirSync(schemaPath, "utf8");

    return schemaDirList.flatMap((basename) => {
      const schemaDirPath = path.join(schemaPath, basename);

      if (fs.statSync(schemaDirPath).isDirectory()) {
        if (path.basename(schemaDirPath) === "$id") {
          const dataDirList = fs
            .readdirSync(dataPath, "utf8")
            .filter((basename) =>
              fs.statSync(path.join(dataPath, basename)).isDirectory()
            );

          return dataDirList.flatMap((basename) => {
            const dataDirPath = path.join(dataPath, basename);
            return process(schemaDirPath, dataDirPath);
          });
        } else {
          const dataDirPath = path.join(dataPath, basename);
          return process(schemaDirPath, dataDirPath);
        }
      } else {
        const dataDirPath = path.join(dataPath, basename);
        return process(schemaDirPath, dataDirPath);
      }
    });
  } else {
    const getType = (): ProcessItem[ "type" ] => {
      if (path.basename(schemaPath) !== "index.json") {
        return "unknown";
      }

      if (schemaPath === path.join(schemaDir, path.basename(schemaPath))) {
        return "config";
      }

      if (schemaPath.endsWith("/$id/index.json")) {
        return "item";
      }

      const data = readJSON(dataPath);
      if ("count" in data) {
        return "list";
      }

      if (schemaPath.includes("/$id/")) {
        return "item-child";
      }

      return "unknown";
    };

    return [
      {
        type: getType(),
        schemaPath,
        dataPath,
      },
    ];
  }
};

const items = process(schemaDir, dataDir);

const lists = items.filter((item) => item.type === "list");

type ProcessItemWithChildren = ProcessItem & {
  id: number;
  i: number;
  children: ProcessItemWithChildren[];
};

const listWithItems = lists.map((list, l): ProcessItemWithChildren => {
  const base = path.parse(list.dataPath).dir + "/";

  let childrenFound = false;

  const listItems = items
    .filter((item) => item.type === "item" && item.dataPath.startsWith(base))
    .map((item, i): ProcessItemWithChildren => {
      const baseItem = path.parse(item.dataPath).dir;

      const children =
        i === 0 || childrenFound
          ? items
            .filter(
              (child) =>
                child.type === "item-child" &&
                child.dataPath.startsWith(baseItem + "/")
            )
            .map(
              (child, i): ProcessItemWithChildren => ({
                ...child,
                id: readJSON(child.dataPath).id,
                i,
                children: [],
              })
            )
          : [];

      if (children.length > 0) {
        childrenFound = true;
      }

      return {
        i,
        id: readJSON(item.dataPath).id,
        ...item,
        children,
      };
    });

  return {
    i: l,
    id: readJSON(list.dataPath).id,
    ...list,
    children: listItems,
  };
});

const promises = listWithItems.map(async (list) => {
  const listDirRelPath = path
    .parse(list.schemaPath)
    .dir.slice(schemaDir.length + 1);

  const listModulePath = path.join(modulesDir, listDirRelPath);
  const listModuleIndexPath = path.join(listModulePath, "index.ts");

  fs.mkdirSync(listModulePath, { recursive: true });

  // const listChildrenGlobPath = path.join(
  //   path.parse(path.relative(listModulePath, list.dataPath)).dir,
  //   "*",
  //   "index.json"
  // );

  const listChildrenVariablePath = path
    .join(path.parse(list.dataPath).dir, "${id}", "index.json")
    .slice(rootDir.length + 1);

  const listChildrenSchemaPath = list.children[ 0 ].schemaPath;

  const listName = path.basename(listModulePath);

  const listNameCamel = convertCase.toCamelCase(listName);
  // const listNameLoad = convertCase.toCamelCase("load-" + listName + "-data");
  // const listNameCamelData = convertCase.toCamelCase(
  //   "get-" + listName + "-data"
  // );
  const listNameCamelFetchItem = convertCase.toCamelCase(
    "fetch-" + listName + "-data-item"
  );
  const listNameCamelFetchAll = convertCase.toCamelCase(
    "fetch-" + listName + "-data-all"
  );
  const listNameCamelStore = convertCase.toCamelCase(listName + "-store");
  const listNameCamelGetOrFetchItem = convertCase.toCamelCase(
    "get-or-fetch-" + listName + "-data-item"
  );
  const listNameCamelGetOrFetchAll = convertCase.toCamelCase(
    "get-or-fetch-" + listName + "-data-all"
  );

  const listNamePascal = convertCase.toPascalCase(listName);
  const listNamePascalDB = convertCase.toPascalCase(listName + "-DB");

  const schemaTypes = await compile(
    readJSON(listChildrenSchemaPath) as never,
    listNamePascal,
    {
      bannerComment: `/**
    * Generated by custom script, based on JSON schema: \`${listChildrenSchemaPath}\`
    */`,
      $refOptions: {
        resolve: {
          file: {
            read: (
              file: { url: string },
              callback: (error: unknown, data: string | null) => void
            ): string => {
              let filePath = file.url;

              if (filePath.startsWith("/")) {
                filePath = "." + filePath;
                filePath = path.join(rootDataDir, filePath);
              }

              try {
                const result = fs.readFileSync(filePath, "utf8");
                callback?.(null, result);
                return result;
              } catch (err) {
                callback(err, null);
                throw err;
              }
            },
          },
        },
      },
    }
  );

  const indexContent = await prettier.format(
    `
    import type { EntityTable } from "dexie";

  ${schemaTypes}

  export const ${listNameCamelFetchItem} = async (id: number) =>
    fetch(
      \`${listChildrenVariablePath}\`
    ).then<${listNamePascal}>((res) => res.json());
  
  export const ${listNameCamelFetchAll} = () =>
    Promise.all(
[${list.children
      .map(({ id }) => id)
      .sort((a, b) => (a < b ? -1 : 1))
      .join(",")}]
      .map(${listNameCamelFetchItem})
    );

  export type ${listNamePascalDB}<D extends { id: number }> = {
    ${listNameCamel}: EntityTable<
      D,
      "id" // primary key
    >;
  };

  export const ${listNameCamelStore} = {
    ${listNameCamel}: "++id",
  };

  export const ${listNameCamelGetOrFetchItem} = async <D extends { id: number }>(
    id: D['id'],
    { db, pickFn }: {
      db: {
        ${listNameCamel}: EntityTable<D, "id">;
      };
      pickFn: (data: ${listNamePascal}) => D;
    }
  ) => {
    console.log('Loading static-data "${listName}" item...');
    // console.time('Loading static-data "${listName}" item');

    const value = await db.${listNameCamel}.get(id as never);
    if (value) {
      // console.timeEnd('Loading static-data "${listName}" item');
      console.log("Last loading was done from client DB table");
      return value;
    }
  
    const fetchedValue = await ${listNameCamelFetchItem}(id).then(pickFn);
    await db.${listNameCamel}.add(fetchedValue);
    
    // console.timeEnd('Loading static-data "${listName}" item');
    console.log("Last loading was done from network");
  
    return fetchedValue;
  };
  
  export const ${listNameCamelGetOrFetchAll} = async <D extends { id: number }>({
    db, pickFn, filterFn = () => true
  }: {
    db: {
      ${listNameCamel}: EntityTable<D, "id">;
    };
    pickFn: (data: ${listNamePascal}) => D;
    filterFn?: (data: ${listNamePascal}) => boolean;
  }) => {
    console.log('Loading static-data "${listName}" list...');
    // console.time('Loading static-data "${listName}" list');

    const dbData = await db.${listNameCamel}.toArray();
    if (dbData.length > 0) {
      // console.timeEnd('Loading static-data "${listName}" list');
      console.log("Last loading was done from client DB table, list length:", dbData.length);
      return dbData;
    }

    const fetchedValues = await ${listNameCamelFetchAll}().then((data) =>
      data.filter(filterFn).map(pickFn)
    );
    await db.${listNameCamel}.clear();
    await db.${listNameCamel}.bulkAdd(fetchedValues);
    
    // console.timeEnd('Loading static-data "${listName}" list');
    console.log("Last loading was done from network, list length:", dbData.length);
  
    return fetchedValues;
  };

  `,
    {
      parser: "typescript",
    }
  );

  // `/pokeapi/data/api/v2/pokemon-species/${id}/index.json`

  fs.writeFileSync(listModuleIndexPath, indexContent, "utf8");
});

await Promise.all(promises);

// console.log(
//   items.filter(
//     (item) =>
//       item.type !== "list" && item.type !== "item" && item.type !== "item-child"
//   )
// );
