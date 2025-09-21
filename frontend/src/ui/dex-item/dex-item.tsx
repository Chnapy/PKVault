import { css } from "@emotion/css";
import React from "react";
import { useStaticData } from '../../hooks/use-static-data';
import { ButtonLike } from '../button/button-like';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { theme } from "../theme";
import { getSpeciesNO } from './util/get-species-no';

export type DexItemProps = {
  species: number;
  seen: boolean;
  caught: boolean;
  owned: boolean;
  ownedShiny: boolean;
  // caughtVersions: GameVersion[];
  // seenOnlyVersions: GameVersion[];
  selected?: boolean;
  onClick?: () => void;
};

export const DexItem: React.FC<DexItemProps> = React.memo(
  ({ species, seen, caught, owned, ownedShiny, selected, onClick }) => {
    const staticData = useStaticData();
    const { name, spriteDefault, spriteShiny } = staticData.species[ species ];

    const pokeballSprite = staticData.itemPokeball.sprite;

    const sprite = ownedShiny ? spriteShiny : spriteDefault;

    // const caughtGamesColors = [ ...new Set(caughtVersions.map(getGameInfos).map(infos => infos.img)) ];
    // const seenOnlyGamesColors = [ ...new Set(seenOnlyVersions.map(getGameInfos).map(infos => infos.img)) ];

    return (
      <ButtonLike
        onClick={onClick}
        selected={selected}
        noDropshadow={!onClick}
        disabled={!onClick}
        style={{
          position: 'relative',
          alignSelf: "flex-start",
          padding: 0,
          borderColor: seen ? theme.text.default : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: '0 2px',
            backgroundColor: theme.bg.darker,
            color: theme.text.light,
            borderBottomRightRadius: 4,
          }}
        >
          <span>{getSpeciesNO(species)}</span>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 2,
            top: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {ownedShiny && <ShinyIcon style={{ height: '0.8lh' }} />}

          {owned && <Icon name='folder' solid forButton />}

          {caught && (
            <img
              src={pokeballSprite!}
              loading="lazy"
              style={{
                height: '1lh',
                margin: '0 -2px',
                // imageRendering: "pixelated",
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
            src={sprite}
            alt={name}
            loading="lazy"
            className={css({
              imageRendering: "pixelated",
              width: 96,
              height: 96,
              filter: seen ? undefined : "brightness(0) opacity(0.5)",
              display: "block",
            })}
          />

          {/* <div
            style={{
              position: 'absolute',
              left: 4,
              right: 4,
              bottom: 4,
              overflow: 'hidden',
              display: 'flex',
              gap: 2,
            }}>
            {caughtGamesColors.map((img) => <img
              key={img}
              src={img}
              style={{
                width: 12,
                height: 12,
              }}
            />)}

            {seenOnlyGamesColors.map((img) => <img
              key={img}
              src={img}
              style={{
                width: 8,
                height: 8,
                margin: 2,
              }}
            />)}
          </div> */}
        </div>
      </ButtonLike>
    );
  }
);
