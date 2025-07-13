import { pick } from "@tanstack/react-router";
import type React from "react";
import { db } from "../../data/db/db";
import { getOrFetchItemDataItem } from "../../data/static-data/pokeapi/item";
import { getOrFetchPokemonDataAll } from "../../data/static-data/pokeapi/pokemon";
import { prepareStaticData } from "../../data/static-data/prepare-static-data";
import { arrayToRecord } from "../../util/array-to-record";
import { Container } from "../container/container";
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { TitleContainer } from "../title-container/title-container";

export type DetailsCardProps = {
  species: number;
  speciesName: string;
  speciesNameTranslated?: string;
  description?: string;
  caught: boolean;
  fromSaves: React.ReactNode;
  compatibleGames: React.ReactNode;
};

const getStaticPokemonData = prepareStaticData(async () => {
  const allData = await getOrFetchPokemonDataAll(db);

  return arrayToRecord(
    allData.map((data) => pick(data, ["id", "sprites"])),
    "id"
  );
});

const getStaticPokeballData = prepareStaticData(async () => {
  return await getOrFetchItemDataItem(db, 4);
});

export const DetailsCard: React.FC<DetailsCardProps> = ({
  species,
  speciesName,
  speciesNameTranslated,
  description,
  caught,
  fromSaves,
  compatibleGames,
}) => {
  const pokemonDataItem = getStaticPokemonData()[species];

  const pokeballSprite = getStaticPokeballData()!.sprites.default;
  const defaultSprite = pokemonDataItem.sprites.front_default;
  const shinySprite = pokemonDataItem.sprites.front_shiny;

  return (
    <Container padding="big" borderRadius="big" style={{ display: "block" }}>
      <div style={{ marginBottom: 2, display: "flex", gap: 4 }}>
        {fromSaves}
      </div>

      <div
        style={{
          borderRadius: 8,
          padding: 4,
          background: theme.bg.info,
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              marginLeft: -4,
              marginTop: -4,
              marginRight: 4,
              padding: 4,
              borderRadius: 8,
              background: theme.bg.dark,
            }}
          >
            <img
              src={defaultSprite!}
              alt={speciesNameTranslated ?? speciesName}
              style={{
                imageRendering: "pixelated",
                width: 96,
                display: "block",
                background: theme.bg.default,
                borderRadius: 8,
              }}
            />
          </div>

          <TextContainer>
            {caught && (
              <img
                src={pokeballSprite!}
                style={{
                  // imageRendering: "pixelated",
                  height: 20,
                  margin: -4,
                  marginRight: 2,
                  paddingBottom: 1,
                  verticalAlign: "text-bottom",
                }}
              />
            )}
            N°{getSpeciesNO(species)} - {speciesNameTranslated}
          </TextContainer>
        </div>

        {description && (
          <div style={{ display: "flex", marginTop: 4 }}>
            <TextContainer>{description}</TextContainer>
          </div>
        )}

        <div style={{ marginTop: 4 }}>
          <TitleContainer title="Owned in games">
            <img src={defaultSprite!} alt="From Blue" style={{ width: 32 }} />
            <img src={shinySprite!} alt="From Crystal" style={{ width: 32 }} />
          </TitleContainer>
        </div>
      </div>
      <div
        style={{
          marginTop: 8,
          padding: 4,
          background: theme.bg.dark,
          borderRadius: 8,
        }}
      >
        <TitleContainer title="Compatible with games">
          <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
            {/* <Button bgColor={theme.game.blue} onClick={console.log}>
              Blue
            </Button>
            <Button bgColor={theme.game.crystal} onClick={console.log}>
              Crystal
            </Button>
            <Button bgColor={theme.game.saphir} onClick={console.log}>
              Saphir
            </Button> */}
            {compatibleGames}
          </div>
        </TitleContainer>
      </div>
    </Container>
  );
};
