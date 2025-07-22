import React from "react";
import type { GameVersion } from "../../data/sdk/model";
import { useStaticData } from "../../data/static-data/static-data";
import { getGameInfos } from "../../pokedex/details/util/get-game-infos";
import { Button } from "../button/button";
import { Container } from "../container/container";
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";

export type StorageItemDetailsProps = {
  header: React.ReactNode;
  saveId?: number;
  species: number;
  speciesName: string;
  version?: GameVersion;
  generation: number;
  isEgg?: boolean;
  originStr: string;
  nickname?: string;
  stats: number[];
  ivs: number[];
  evs: number[];
  nature?: number;
  ability?: number;
  level: number;
  exp: number;
  moves: number[];
  isValid: boolean;
  validityReport: string;
};

export const StorageItemDetails: React.FC<StorageItemDetailsProps> = ({
  header,
  saveId,
  species,
  speciesName,
  version,
  generation,
  isEgg,
  originStr,
  nickname,
  stats,
  ivs,
  evs,
  nature,
  ability,
  level,
  exp,
  moves,
  isValid,
  validityReport,
}) => {
  const staticData = useStaticData();
  const pokemonDataItem = staticData.pokemon[species];

  const pokeballSprite = staticData.item.pkball.sprites.default;
  const defaultSprite = pokemonDataItem.sprites.front_default;
  // const shinySprite = pokemonDataItem.sprites.front_shiny;

  return (
    <Container padding="big" borderRadius="big" style={{ display: "block" }}>
      <div style={{ marginBottom: 2, display: "flex", gap: 4 }}>
        {header}
        {/* <Button>Gen 4 (original)</Button>
        <Button>Create for Gen 2</Button> */}
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
              alt={speciesName}
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
            N°{getSpeciesNO(species)} - {speciesName}
          </TextContainer>
        </div>

        <div style={{ display: "flex", marginTop: 4 }}>
          <TextContainer>
            <div>
              <Button>Delete version</Button>
            </div>
            <div>
              Generation: {generation}
              <br />
              From game: Pokemon {version &&
                getGameInfos(version).text} (save {saveId})
              <br />
              <br />
              Is egg: {isEgg ? "true" : "false"}
              <br />
              <br />
              Origin: {originStr} <Button>Edit</Button>
              <br />
              Nickname: {nickname} <Button>Edit</Button>
              <br />
              Stats: {stats.join("/")}
              <br />
              EVs: {evs.join("/")}
              <br />
              IVs: {ivs.join("/")}
              <br />
              <br />
              Nature: {nature}
              <br />
              Ability: {ability}
              <br />
              <br />
              LVL {level} - EXP {exp}
              <br />
              <br />
              Moves: {moves.join("/")} <Button>Edit</Button>
              <br />
              Status: {isValid ? "true" : "false"}
              <br />
              Status message: {validityReport}
            </div>
          </TextContainer>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
        }}
      >
        <Button disabled>Delete full PKM</Button>
        <Button disabled>Evolve</Button>
      </div>
    </Container>
  );
};
