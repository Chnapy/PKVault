import React from "react";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png?url';
import { GenderType, MoveCategory, type GameVersion } from "../../data/sdk/model";
import { Button } from "../button/button";
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { DetailsCardContainer } from '../details-card/details-card-container';
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { Gender } from '../gender/gender';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { StorageDetailsForm } from './storage-details-form';
import { TextMoves } from './text-moves';
import { TextOrigin } from './text-origin';
import { TextStats } from './text-stats';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Icon } from '../icon/icon';

export type StorageSaveDetailsProps = {
  id: string;
  saveId: number;
  generation: number;
  version: GameVersion;

  pid: number;
  species: number;
  speciesName: string;
  isShiny: boolean;
  isEgg: boolean;
  isShadow: boolean;
  sprite?: string;
  ballSprite?: string;
  gender?: GenderType;
  nickname: string;
  nicknameMaxLength: number;

  types: number[];
  stats: number[];
  ivs: number[];
  evs: number[];
  hiddenPowerType: number;
  hiddenPowerPower: number;
  hiddenPowerCategory: MoveCategory;
  nature?: number;
  ability: number;
  level: number;
  exp: number;
  moves: number[];
  availableMoves: number[];

  tid: number;
  originTrainerName: string;
  originTrainerGender: GenderType;
  originMetDate?: string;
  originMetLocation: string;
  originMetLevel?: number;

  heldItem: number;

  isValid: boolean;
  validityReport: string;

  box: number;
  boxSlot: number;

  mainBoxId?: number;
  mainBoxSlot?: number;
  saveSynchronized: boolean;

  canMoveToMainStorage: boolean;

  goToMainPkm?: () => void;

  onRelease?: () => void;

  onClose: () => void;
};

export const StorageSaveDetails: React.FC<StorageSaveDetailsProps> = ({
  id,
  saveId,
  generation,
  version,

  pid,
  species,
  speciesName,
  isShiny,
  isEgg,
  isShadow,
  sprite,
  ballSprite,
  gender,
  nickname,
  nicknameMaxLength,

  types,
  stats,
  ivs,
  evs,
  hiddenPowerType,
  hiddenPowerPower,
  hiddenPowerCategory,
  nature,
  ability,
  level,
  exp,
  moves,
  availableMoves,

  tid,
  originTrainerName,
  originTrainerGender,
  originMetDate,
  originMetLocation,
  originMetLevel,

  heldItem,

  isValid,
  validityReport,

  box,
  boxSlot,

  mainBoxId,
  mainBoxSlot,
  saveSynchronized,

  canMoveToMainStorage,

  goToMainPkm,
  onRelease,
  onClose,
}) => {
  const formContext = StorageDetailsForm.useContext();

  const staticData = useStaticData();

  return (
    <DetailsCardContainer
      header={null}
      title={
        <>
          <img
            src={getGameInfos(version).img}
            style={{ height: 28 }}
          />

          <div style={{ flexGrow: 1 }}>
            G{generation} / {staticData.versions[ version ].name}
          </div>

          <ButtonWithConfirm
            onClick={onRelease}
            disabled={!onRelease}
            bgColor={theme.bg.red}
          >
            <Icon name='trash' solid forButton />
          </ButtonWithConfirm>

          <Button
            onClick={formContext.startEdit}
            bgColor={theme.bg.primary}
            disabled={formContext.editMode}
          >
            <Icon name='pen' solid forButton />
          </Button>
        </>
      }
      mainImg={
        <>
          <div
            style={{
              background: theme.bg.default,
              borderRadius: 8,
            }}
          >
            <img
              src={sprite}
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
          {formContext.editMode
            ? <input
              {...formContext.register('nickname', { maxLength: nicknameMaxLength })}
              maxLength={nicknameMaxLength}
              style={{ width: 8 * nicknameMaxLength, padding: 0, textAlign: 'center' }}
            />
            : nickname}
          {' - '}<span style={{ color: theme.text.primary }}>{speciesName}</span>

          {gender !== undefined && <span
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
        {!isValid && <TextContainer>
          {validityReport}
        </TextContainer>}

        {!!mainBoxId && !!mainBoxSlot && goToMainPkm && <>
          <Button onClick={goToMainPkm}>
            <div style={{ width: '100%' }}>
              Go to main-pkm
            </div>
            <div style={{ width: '100%' }}>
              Box {mainBoxId} slot {mainBoxSlot}
            </div>
            <div style={{ width: '100%', color: !saveSynchronized ? theme.text.contrast : undefined }}>
              {saveSynchronized ? 'synchronized' : 'unsynchronized'}
            </div>
          </Button>
        </>}
      </>}
      content={
        <>
          {!!heldItem && <TextContainer>
            Held item <span style={{ color: theme.text.primary }}>{staticData.items[ heldItem ].name}</span> <img
              src={staticData.items[ heldItem ].sprite}
              alt={staticData.items[ heldItem ].name}
              style={{
                height: 24,
                verticalAlign: 'middle'
              }} />
          </TextContainer>}

          <TextContainer noWrap>
            <TextStats
              nature={nature}
              ivs={ivs}
              evs={evs}
              maxEv={staticData.versions[ version ].maxEV}
              stats={stats}
              hiddenPowerType={hiddenPowerType}
              hiddenPowerPower={hiddenPowerPower}
              hiddenPowerCategory={hiddenPowerCategory}
            />
          </TextContainer>

          <TextContainer>
            <TextMoves
              ability={ability}
              moves={moves}
              availableMoves={availableMoves}
              generation={generation}
              hiddenPowerType={hiddenPowerType}
              hiddenPowerPower={hiddenPowerPower}
              hiddenPowerCategory={hiddenPowerCategory}
            />
          </TextContainer>

          {formContext.editMode && <div style={{
            display: 'flex',
            gap: 4
          }}>
            <Button
              onClick={() => formContext.cancel()}
              style={{ flexGrow: 1 }}
            >
              Cancel
            </Button>

            <ButtonWithConfirm
              onClick={() => formContext.submitForPkmSave(saveId, id)}
              style={{ flexGrow: 1 }}
            >
              Submit changes
            </ButtonWithConfirm>
          </div>}

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

          {/* {saveCardProps && <SaveCardContentSmall {...saveCardProps} />} */}
        </>
      }
      onClose={onClose}
    />
  );
};
