import React from "react";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png';
import { useBallByIdOrName } from '../../data/hooks/use-ball-by-id-or-name';
import { useCurrentLanguageName } from '../../data/hooks/use-current-language-name';
import { type GameVersion } from "../../data/sdk/model";
import { useStaticData } from "../../data/static-data/static-data";
import type { GenderType } from '../../data/utils/get-gender';
import { getGameInfos } from "../../pokedex/details/util/get-game-infos";
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
import { Button } from "../button/button";
import { DetailsCardContainer } from '../details-card/details-card-container';
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { Gender } from '../gender/gender';
import { SaveCardContentSmall } from '../save-card/save-card-content-small';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";

export type StorageSaveDetailsProps = {
  id: string;
  saveId: number;
  generation: number;
  version: GameVersion;

  pid: number;
  species: number;
  isShiny: boolean;
  isEgg: boolean;
  isShadow: boolean;
  ball: number;
  gender: GenderType;
  nickname: string;

  types: string[];
  stats: number[];
  ivs: number[];
  evs: number[];
  hiddenPowerType: string;
  hiddenPowerPower: number;
  nature?: string;
  ability?: string;
  level: number;
  exp: number;
  moves: string[];

  tid: number;
  originTrainerName: string;
  originTrainerGender: GenderType;
  originMetDate?: string;
  originMetLocation: number;

  isValid: boolean;
  validityReport: string;

  box: number;
  boxSlot: number;

  canMoveToMainStorage: boolean;

  // pkmId?: string;
  onDelete: () => void;
  onClose: () => void;
};

export const StorageSaveDetails: React.FC<StorageSaveDetailsProps> = ({
  id,
  saveId,
  generation,
  version,

  pid,
  species,
  isShiny,
  isEgg,
  isShadow,
  ball,
  gender,
  nickname,

  types,
  stats,
  ivs,
  evs,
  hiddenPowerType,
  hiddenPowerPower,
  nature,
  ability,
  level,
  exp,
  moves,

  tid,
  originTrainerName,
  originTrainerGender,
  originMetDate,
  originMetLocation,

  isValid,
  validityReport,

  box,
  boxSlot,

  canMoveToMainStorage,

  onDelete,
  onClose,
}) => {
  const staticData = useStaticData();
  const pokemonDataItem = staticData.pokemon[ species ];

  const getCurrentLanguageName = useCurrentLanguageName();

  const saveCardProps = useSaveItemProps()(saveId);

  const speciesName = getCurrentLanguageName(staticData.pokemonSpecies[ species ].names) ?? staticData.pokemonSpecies[ species ].name;

  const ballSprite = useBallByIdOrName()(ball)?.sprites.default;

  const defaultSprite = pokemonDataItem.sprites.front_default;
  const shinySprite = pokemonDataItem.sprites.front_shiny;

  const getSprite = () => {
    if (isEgg) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png';
    }

    return isShiny ? shinySprite! : defaultSprite!
  }

  return (
    <DetailsCardContainer
      mainImg={
        <>
          <div
            style={{
              background: theme.bg.default,
              borderRadius: 8,
            }}
          >
            <img
              src={getSprite()}
              alt={speciesName}
              style={{
                imageRendering: "pixelated",
                width: 96,
                display: "block",
                filter: isShadow ? 'drop-shadow(#770044 0px 0px 6px)' : undefined,
              }}
            />
          </div>

          <img
            src={ballSprite!}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}
          />

          {isShiny && <img
            src={shinyIconImg}
            alt='shiny-icon'
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              // width: 12,
              margin: '0 -2px',
            }}
          />}
        </>
      }
      mainInfos={
        <>

          {nickname && `${nickname} - `}<span style={{ color: theme.text.primary }}>{speciesName}</span>

          {gender && <span
            style={{
              float: 'right',
            }}
          >
            <Gender gender={gender} />
          </span>}
          <br />
          {types.join(' - ')}
          <span
            style={{
              float: 'right',
            }}
          >
            Lv.<span style={{ color: theme.text.primary }}>{level}</span>
          </span>
          <br />
          Dex local N°<span style={{ color: theme.text.primary }}>TODO</span>{' '}
          Dex natio. N°<span style={{ color: theme.text.primary }}>{getSpeciesNO(species)}</span>
          <br />
          ID <span style={{ color: theme.text.primary }}>{id}</span> {pid > 0 && <>PID <span style={{ color: theme.text.primary }}>{pid}</span></>}
        </>
      }
      preContent={validityReport && <TextContainer>
        {validityReport}
      </TextContainer>}
      content={
        <>
          <TextContainer>
            {nature && <>
              Nature <span style={{ color: theme.text.primary }}>{nature}</span>
              <br />
            </>}

            <table>
              <thead>
                <tr>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}></td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>HP.</td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>Atk</td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>Def</td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>SpA</td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>SpD</td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>Spe</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: 0 }}>
                    <span style={{ color: theme.text.primary }}>IVs</span>
                  </td>
                  {ivs.map((iv, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{iv}</td>)}
                </tr>
                <tr>
                  <td style={{ padding: 0 }}>
                    <span style={{ color: theme.text.primary }}>EVs</span>
                  </td>
                  {evs.map((ev, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{ev}</td>)}
                </tr>
                <tr>
                  <td style={{ padding: 0 }}>
                    <span style={{ color: theme.text.primary }}>Stats</span>
                  </td>
                  {stats.map((stat, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{stat}</td>)}
                </tr>
              </tbody>
            </table>
            <br />
            Hidden power <span style={{ color: theme.text.primary }}>{hiddenPowerType}</span> - <span style={{ color: theme.text.primary }}>{hiddenPowerPower}</span>
          </TextContainer>

          <TextContainer>
            {ability && <>
              Ability <span style={{ color: theme.text.primary }}>{ability}</span>
              <br /><br />
            </>}
            <span style={{ color: theme.text.primary }}>Moves</span>
            <br />
            {moves.map((move, i) => <div key={i}>
              {i + 1}. {move}
            </div>)}
          </TextContainer>

          <TextContainer>
            <span style={{ color: theme.text.primary }}>Origin</span>
            <br />
            Game <span style={{ color: theme.text.primary }}>Pokemon {getGameInfos(version).text}</span>
            <br />
            OT {originTrainerName} <Gender gender={originTrainerGender} /> - TID <span style={{ color: theme.text.primary }}>{tid}</span>
            <br />
            {originMetLocation}
          </TextContainer>

          {saveCardProps && <SaveCardContentSmall {...saveCardProps} />}
        </>
      }
      actions={<>
        <Button onClick={onDelete}>Delete version</Button>
        <Button disabled>Evolve</Button>
        <Button disabled>Delete full PKM</Button>
      </>}
      onClose={onClose}
    />
  );
};
