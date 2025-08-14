import React from "react";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png';
import { useBallByIdOrName } from '../../data/hooks/use-ball-by-id-or-name';
import { useCurrentLanguageName } from '../../data/hooks/use-current-language-name';
import { type GameVersion } from "../../data/sdk/model";
import { useStaticData } from "../../data/static-data/static-data";
import type { GenderType } from '../../data/utils/get-gender';
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
import { Button } from "../button/button";
import { DetailsCardContainer } from '../details-card/details-card-container';
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { Gender } from '../gender/gender';
import { SaveCardContentSmall } from '../save-card/save-card-content-small';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { TextMoves } from './text-moves';
import { TextOrigin } from './text-origin';
import { TextStats } from './text-stats';
import { ItemImg } from '../item-img/item-img';

export type StorageMainDetailsProps = {
  header: React.ReactNode;
  id: string;
  saveId?: number;
  generation: number;
  version: GameVersion;

  pid: number;
  species: number;
  isShiny: boolean;
  isEgg: boolean;
  // isShadow: boolean;
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
  originMetLocation: string;
  originMetLevel?: number;

  heldItemSprite?: number;
  heldItemText?: string;

  isValid: boolean;
  validityReport: string;

  box: number;
  boxSlot: number;

  saveBoxId?: number;
  saveBoxSlot?: number;
  saveSynchronized?: boolean;

  // canMoveToMainStorage: boolean;

  goToSavePkm?: () => void;

  onRelease: () => void;

  onClose: () => void;
};

export const StorageMainDetails: React.FC<StorageMainDetailsProps> = ({
  header,
  id,
  saveId,
  generation,
  version,

  pid,
  species,
  isShiny,
  isEgg,
  // isShadow,
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
  originMetLevel,

  heldItemSprite,
  heldItemText,

  isValid,
  validityReport,

  box,
  boxSlot,

  saveBoxId,
  saveBoxSlot,
  saveSynchronized,

  goToSavePkm,

  // canMoveToMainStorage,

  onRelease,
  onClose,
}) => {
  const staticData = useStaticData();
  const pokemonDataItem = staticData.pokemon[ species ];

  const getCurrentLanguageName = useCurrentLanguageName();

  const getSaveItemProps = useSaveItemProps();
  const saveCardProps = saveId ? getSaveItemProps(saveId) : undefined;

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
      header={header}
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
      preContent={<>
        {validityReport && <TextContainer>
          {validityReport}
        </TextContainer>}

        {heldItemSprite && <TextContainer>
          Held item <span style={{ color: theme.text.primary }}>{heldItemText}</span> <ItemImg spriteItem={heldItemSprite} alt={heldItemText} style={{
            height: 24,
            verticalAlign: 'middle'
          }} />
        </TextContainer>}

        {saveId && <Button onClick={goToSavePkm} disabled={!goToSavePkm}>
          <div style={{ width: '100%' }}>
            Go to save-pkm
          </div>
          <div style={{ width: '100%' }}>
            Box {saveBoxId} slot {saveBoxSlot}
          </div>
          <div style={{ width: '100%', color: !saveSynchronized ? theme.text.contrast : undefined }}>
            {saveSynchronized ? 'synchronized' : 'unsynchronized'}
          </div>
        </Button>}
      </>}
      content={
        <>
          <TextContainer>
            <TextStats
              nature={nature}
              ivs={ivs}
              evs={evs}
              stats={stats}
              hiddenPowerType={hiddenPowerType}
              hiddenPowerPower={hiddenPowerPower}
            />
          </TextContainer>

          <TextContainer>
            <TextMoves
              ability={ability}
              moves={moves}
            />
          </TextContainer>

          <TextContainer>
            <TextOrigin
              version={version}
              tid={tid}
              originTrainerName={originTrainerName}
              originTrainerGender={originTrainerGender}
              originMetDate={originMetDate}
              originMetLocation={originMetLocation}
              originMetLevel={originMetLevel}
            />
          </TextContainer>

          {saveCardProps && <SaveCardContentSmall {...saveCardProps} />}
        </>
      }
      actions={<>
        <Button onClick={onRelease}>Release</Button>
        {/* <Button disabled>Evolve</Button> */}
        {/* <Button disabled>Delete full PKM</Button> */}
      </>}
      onClose={onClose}
    />
  );
};
