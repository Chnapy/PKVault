import React from "react";
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { GenderType } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { SpeciesImg } from '../details-card/species-img';
import { Gender } from '../gender/gender';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { theme } from "../theme";

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

export const DexFormItem: React.FC<{
  species: number;
  generation: number;
  form: number;
  gender?: GenderType;
  seen: boolean;
  seenShiny: boolean;
  caught: boolean;
  owned: boolean;
  ownedShiny: boolean;
}> = ({ species, generation, form, gender, seen, caught, owned, ownedShiny }) => {
  const staticData = useStaticData();

  const pokeballSprite = getApiFullUrl(staticData.itemPokeball.sprite);

  // const caughtGamesColors = [ ...new Set(caughtVersions.map(getGameInfos).map(infos => infos.img)) ];
  // const seenOnlyGamesColors = [ ...new Set(seenOnlyVersions.map(getGameInfos).map(infos => infos.img)) ];

  return (
    <div
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
            src={pokeballSprite}
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
          position: 'absolute',
          right: 2,
          // left: '50%',
          bottom: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {gender !== undefined && <Gender gender={gender} />}
      </div>

      <div
        style={{
          display: 'flex',
          background: theme.bg.default,
          borderRadius: 2,
        }}
      >
        <SpeciesImg species={species} generation={generation} form={form} isFemale={gender == GenderType.FEMALE} isShiny={ownedShiny} style={{
          filter: seen ? undefined : "brightness(0) opacity(0.5)",
        }} />
      </div>
    </div>
  );
};
