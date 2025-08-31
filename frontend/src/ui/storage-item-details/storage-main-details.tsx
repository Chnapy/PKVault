import React from "react";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png?url';
import { GenderType, type GameVersion, type MoveItem } from "../../data/sdk/model";
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
import { Button } from "../button/button";
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { DetailsCardContainer } from '../details-card/details-card-container';
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { Gender } from '../gender/gender';
import { ItemImg } from '../item-img/item-img';
import { SaveCardContentSmall } from '../save-card/save-card-content-small';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { StorageDetailsForm } from './storage-details-form';
import { TextMoves } from './text-moves';
import { TextOrigin } from './text-origin';
import { TextStats } from './text-stats';

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
  isEgg: boolean;
  // isShadow: boolean;
  sprite?: string;
  ballSprite?: string;
  gender?: GenderType;
  nickname: string;
  nicknameMaxLength: number;

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
  moves: MoveItem[];
  availableMoves: MoveItem[];

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
  attachedSavePkmNotFound?: boolean;

  // canMoveToMainStorage: boolean;

  goToSavePkm?: () => void;

  onEvolve?: () => void;
  onSynchronize?: () => void;
  onSaveCheck?: () => void;
  onDetach?: () => void;
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
  isEgg,
  // isShadow,
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

  heldItemSprite,
  heldItemText,

  isValid,
  validityReport,

  box,
  boxSlot,

  saveBoxId,
  saveBoxSlot,
  saveSynchronized,
  attachedSavePkmNotFound,

  goToSavePkm,

  // canMoveToMainStorage,

  onEvolve,
  onSynchronize,
  onSaveCheck,
  onDetach,
  onRelease,
  onClose,
}) => {
  const formContext = StorageDetailsForm.useContext();

  const getSaveItemProps = useSaveItemProps();
  const saveCardProps = saveId ? getSaveItemProps(saveId) : undefined;

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
            ? <input
              {...formContext.register('nickname', { maxLength: nicknameMaxLength })}
              maxLength={nicknameMaxLength}
              style={{ width: 8 * nicknameMaxLength, padding: 0, textAlign: 'center' }}
            />
            : <>
              {nickname}
              <Button onClick={() => formContext.setValue('editMode', true)} style={{ display: 'inline' }}>E</Button>
            </>}
          {' - '}<span style={{ color: theme.text.primary }}>{speciesName}</span>

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

        {!!heldItemSprite && <TextContainer>
          Held item <span style={{ color: theme.text.primary }}>{heldItemText}</span> <ItemImg spriteItem={heldItemSprite} alt={heldItemText} style={{
            height: 24,
            verticalAlign: 'middle'
          }} />
        </TextContainer>}

        {saveId && <>
          {attachedSavePkmNotFound
            ? <TextContainer>
              Pkm not found in attached save.
              <br />If expected consider detach from save.
              <br />Otherwise check the save integrity.
            </TextContainer>
            : <Button onClick={goToSavePkm} disabled={!goToSavePkm}>
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

        {!saveSynchronized && !!saveId && onSynchronize && <Button onClick={onSynchronize}>
          Synchronize
        </Button>}
      </>}
      content={
        <>
          <TextContainer noWrap>
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
              availableMoves={availableMoves}
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
      actions={<>
        {onDetach && <ButtonWithConfirm onClick={onDetach}>Detach from save</ButtonWithConfirm>}
        {onEvolve && <ButtonWithConfirm onClick={onEvolve}>Evolve</ButtonWithConfirm>}
        {onSaveCheck && <Button onClick={onSaveCheck}>Check save</Button>}
        {onRelease && <ButtonWithConfirm onClick={onRelease}>Release</ButtonWithConfirm>}
        {/* <ButtonWithConfirm disabled>Evolve</ButtonWithConfirm> */}
      </>}
      onClose={onClose}
    />
  );
};
