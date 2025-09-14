import React from "react";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png?url';
import { GenderType, MoveCategory, type GameVersion } from "../../data/sdk/model";
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
import { Button } from "../button/button";
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { DetailsCardContainer } from '../details-card/details-card-container';
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { Gender } from '../gender/gender';
import { SaveCardContentSmall } from '../save-card/save-card-content-small';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { StorageDetailsForm } from './storage-details-form';
import { TextMoves } from './text-moves';
import { TextOrigin } from './text-origin';
import { TextStats } from './text-stats';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Icon } from '../icon/icon';
import { TypeItem } from '../type-item/type-item';
import { TextInput } from '../input/text-input';

export type StorageMainDetailsProps = {
  header: React.ReactNode;
  id: string;
  saveId?: number;
  generation: number;
  version: GameVersion;

  pid: number;
  species: number;
  speciesName: string;
  isShiny: boolean;
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

  saveBoxId?: number;
  saveBoxSlot?: number;
  saveSynchronized?: boolean;
  attachedSavePkmNotFound?: boolean;

  onRelease?: () => void;

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
  speciesName,
  isShiny,
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
  // exp,
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

  saveBoxId,
  saveBoxSlot,
  saveSynchronized,
  attachedSavePkmNotFound,

  // canMoveToMainStorage,

  onRelease,
  onClose,
}) => {
  const formContext = StorageDetailsForm.useContext();

  const staticData = useStaticData();

  const getSaveItemProps = useSaveItemProps();
  const saveCardProps = saveId ? getSaveItemProps(saveId) : undefined;

  return (
    <DetailsCardContainer
      header={header}
      title={
        <>
          <img
            src={getGameInfos(version).img}
            style={{ height: 28 }}
          />

          <div style={{ flexGrow: 1 }}>
            G{generation}
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
            ? <TextInput
              {...formContext.register('nickname', { maxLength: nicknameMaxLength })}
              // maxLength={nicknameMaxLength}
              style={{ display: 'inline-block', height: '1lh', width: 8 * nicknameMaxLength, padding: 0, textAlign: 'center' }}
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
          <div style={{ display: 'flex', gap: 4, height: '1lh' }}>
            {types.map(type => <TypeItem key={type} type={type} />)}
            <span
              style={{
                marginLeft: 'auto',
              }}
            >
              Lv.<span style={{ color: theme.text.primary }}>{level}</span>
            </span>
          </div>
          <br />
          Dex local N°<span style={{ color: theme.text.primary }}>TODO</span>{' '}
          Dex natio. N°<span style={{ color: theme.text.primary }}>{getSpeciesNO(species)}</span>
          <br />
          ID <span style={{ color: theme.text.primary }}>{id}</span> {pid > 0 && <>PID <span style={{ color: theme.text.primary }}>{pid}</span></>}
        </>
      }
      preContent={<>
        {(!isValid || attachedSavePkmNotFound) && <div
          style={{
            backgroundColor: isValid ? undefined : theme.bg.yellow,
            padding: 4,
            margin: -4,
            marginTop: 0,
          }}
        >
          <TextContainer style={{
            maxHeight: 200,
            overflowY: 'auto',
          }}>
            {attachedSavePkmNotFound && <>
              Pkm not found in attached save.
              <br />If expected consider detach from save.
              <br />Otherwise check the save integrity.
            </>}
            {!isValid && validityReport}
          </TextContainer>
        </div>}
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
              onClick={() => formContext.submitForPkmVersion(id)}
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

          {saveCardProps && <SaveCardContentSmall {...saveCardProps} />}
        </>
      }
      onClose={onClose}
    />
  );
};
