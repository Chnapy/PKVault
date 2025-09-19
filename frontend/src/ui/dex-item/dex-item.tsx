import { css } from "@emotion/css";
import React from "react";
import type { GameVersion } from '../../data/sdk/model';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Container } from "../container/container";
import { theme } from "../theme";

const styles = {
  content: css({
    backgroundColor: theme.bg.dark,
    color: theme.text.light,
    textShadow: "1px 1px 0px rgba(255,255,255,0.2)",
    // padding: 2,
    paddingTop: 0,
    borderRadius: 4,
    fontSize: 14,
  }),
};

export type DexItemProps = {
  species: number;
  speciesName: string;
  sprite: string;
  seen: boolean;
  caught: boolean;
  caughtVersions: GameVersion[];
  seenOnlyVersions: GameVersion[];
  selected?: boolean;
  onClick?: () => void;
};

export const DexItem: React.FC<DexItemProps> = React.memo(
  ({ species, speciesName, sprite, seen, caught, caughtVersions, seenOnlyVersions, selected, onClick }) => {
    // const pokeballSprite = staticData.item.pkball.sprites.default;

    const caughtGamesColors = caughtVersions.map(getGameInfos).map(infos => infos.color);
    const seenOnlyGamesColors = seenOnlyVersions.map(getGameInfos).map(infos => infos.color);

    return (
      <Container
        as={onClick ? "button" : undefined}
        // borderRadius="small"
        onClick={onClick}
        selected={selected}
        noDropshadow={!onClick}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <div className={styles.content}>
          {/* <div
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
          </div> */}

          <div
            style={{
              background: theme.bg.default,
              borderRadius: 2,
            }}
          >
            <img
              src={sprite}
              alt={speciesName}
              loading="lazy"
              className={css({
                imageRendering: "pixelated",
                width: 96,
                height: 96,
                filter: seen ? undefined : "brightness(0) opacity(0.5)",
                display: "block",
              })}
            />

            <div
              style={{
                position: 'absolute',
                left: 4,
                bottom: 4,
                display: 'flex',
                gap: 4,
              }}>
              {caughtGamesColors.map((color, i) => <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  backgroundColor: color,
                }}
              />)}

              {seenOnlyGamesColors.map((color, i) => <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  margin: 2,
                  borderRadius: 99,
                  backgroundColor: color,
                }}
              />)}
            </div>
          </div>
        </div>
      </Container>
    );
  }
);
