import { pick } from "@tanstack/react-router";
import React from "react";
import { db } from "../../data/db/db";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { getOrFetchPokemonDataAll } from "../../data/static-data/pokeapi/pokemon";
import { getOrFetchPokemonSpeciesDataAll } from "../../data/static-data/pokeapi/pokemon-species";
import { prepareStaticData } from "../../data/static-data/prepare-static-data";
import { Route } from "../../routes/pokedex";
import { arrayToRecord } from "../../util/array-to-record";
import { PokedexItem } from "./pokedex-item";

const getStaticPokemonSpeciesData = prepareStaticData(async () => {
  const allPkms = await getOrFetchPokemonSpeciesDataAll(db);

  return arrayToRecord(
    allPkms.map((data) => pick(data, ["id", "names"])),
    "id"
  );
});

const getStaticPokemonData = prepareStaticData(async () => {
  const allData = await getOrFetchPokemonDataAll(db);

  return arrayToRecord(
    allData.map((data) => pick(data, ["id", "types"])),
    "id"
  );
});

export const PokedexList: React.FC = () => {
  console.time("pokedex-list");
  const filters = Route.useSearch({ select: (search) => search.filters });

  const { data } = useDexGetAll();

  const speciesNames = getStaticPokemonSpeciesData();
  const speciesTypes = getStaticPokemonData();

  if (!data) {
    return null;
  }

  const speciesRecord = data.data;

  const keys = Object.keys(speciesRecord)
    .map(Number)
    .sort(function (a, b) {
      return a - b;
    });

  const lastKey = keys[keys.length - 1];

  const speciesList = new Array(lastKey).fill(0).map((_, i) => i + 1);

  const items: React.ReactNode[] = speciesList.map((species) => {
    const speciesValues = Object.values(
      speciesRecord[species + ""] ?? {}
    ).filter((value) => {
      if (!filters.fromGames?.length) {
        return true;
      }

      return filters.fromGames.includes(value.saveId);
    });

    if (speciesValues.length === 0) {
      return null;
    }

    // console.log(species, speciesRecord);
    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);
    const speciesName = speciesValues[0].speciesName;

    let divider: React.ReactNode = null;

    if ([151, 251, 386, 494, 649, 721, 809].includes(species - 1)) {
      divider = <hr key={species + "-hr"} style={{ width: "100%" }} />;
    }

    const isFiltered = (): boolean => {
      if (filters.speciesName) {
        const name = speciesNames[species].names.find(
          (n) => n.language.name === "fr"
        )!.name;

        if (!name.includes(filters.speciesName)) {
          return true;
        }
      }

      if (filters.types?.length) {
        const pkmTypes = speciesTypes[species];
        if (
          filters.types.some((type) =>
            pkmTypes.types.every((t) => t.type.name !== type)
          )
        ) {
          return true;
        }
      }

      if (filters.seen !== undefined) {
        if ((filters.seen && !seen) || (!filters.seen && seen)) {
          return true;
        }
      }

      if (filters.caught !== undefined) {
        if ((filters.caught && !caught) || (!filters.caught && caught)) {
          return true;
        }
      }

      if (filters.fromGames?.length) {
        if (
          speciesValues.every(
            (spec) => !filters.fromGames!.includes(spec.saveId)
          )
        ) {
          return true;
        }
      }

      return false;
    };

    if (isFiltered()) {
      return divider;
    }

    return (
      <React.Fragment key={species}>
        {divider}

        <PokedexItem
          species={species}
          speciesName={speciesName}
          seen={seen}
          caught={caught}
        />
      </React.Fragment>
    );
  });

  console.timeEnd("pokedex-list");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        overflow: "auto",
        //   maxHeight: "100%",
        flexWrap: "wrap",
        padding: 4,
      }}
    >
      {items}
    </div>
  );
};
