import { css } from "@emotion/css";
import React from "react";
import { arrayToRecord, db, pick } from "../../db/db";
import { getOrFetchItemDataItem } from "../../pokeapi/modules/v2/item";
import { getOrFetchPokemonDataAll } from "../../pokeapi/modules/v2/pokemon";
import { prepareStaticData } from "../../pokeapi/pokeapi-data";
import { Container } from "../container/container";
import { theme } from "../theme";
import { getSpeciesNO } from "./util/get-species-no";

const styles = {
  content: css({
    backgroundColor: theme.bg.dark,
    color: theme.text.light,
    textShadow: "1px 1px 0px rgba(255,255,255,0.2)",
    padding: 2,
    paddingTop: 0,
    borderRadius: 4,
    fontSize: 14,
  }),
};

const getStaticData = prepareStaticData(async () => {
  const allData = await getOrFetchPokemonDataAll(db);

  return arrayToRecord(
    allData.map((data) => pick(data, ["id", "sprites"])),
    "id"
  );
});

const getStaticPokeballData = prepareStaticData(async () => {
  return await getOrFetchItemDataItem(db, 4);
});

export type DexItemProps = {
  species: number;
  speciesName: string;
  seen: boolean;
  caught: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export const DexItem: React.FC<DexItemProps> = React.memo(
  ({ species, speciesName, seen, caught, selected, onClick }) => {
    const staticData = getStaticData()[species];

    const pokeballSprite = getStaticPokeballData()!.sprites.default;

    return (
      <Container
        as={onClick ? "button" : undefined}
        // borderRadius="small"
        onClick={onClick}
        selected={selected}
        noDropshadow={!onClick}
      >
        <div className={styles.content}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 2,
            }}
          >
            <span>{getSpeciesNO(species)}</span>

            {caught && (
              <img
                src={pokeballSprite!}
                loading="lazy"
                style={{
                  height: 20,
                  margin: -4,
                  imageRendering: "pixelated",
                }}
              />
            )}
          </div>

          <div
            style={{
              background: theme.bg.default,
              borderRadius: 2,
            }}
          >
            <img
              src={staticData.sprites.front_default!}
              alt={speciesName}
              loading="lazy"
              style={{
                imageRendering: "pixelated",
                width: 96,
                height: 96,
                filter: seen ? undefined : "brightness(0) opacity(0.5)",
                display: "block",
              }}
            />
          </div>
        </div>
      </Container>
    );
  }
);
