import { type BoxDTO, type InventoryItemDTO, type PkmVariantDTO } from '../../../../data/sdk/model';
import type { DropValidationResult } from '../types';
import type { ValidateRootSlot } from './validate-root';
import type { ValidateSaveToMainSlot } from './validate-save-to-main';

type Box = Pick<BoxDTO, 'canSaveReceivePkm'>;

export type ValidateMainToSaveSlot = ValidateRootSlot & {
  direction: 'main-to-save';
  sourceBox: Box;
  sourcePkm?: Pick<PkmVariantDTO, 'id' | 'boxId' | 'boxKey' | 'canMoveToSave' | 'canMoveAttachedToSave' | 'compatibleWithVersions'>;
  sourceItem?: Pick<InventoryItemDTO, 'id' | 'item' | 'version' | 'count'>;
  targetSave: ValidateSaveToMainSlot[ 'sourceSave' ];
  targetBox?: Box;
  targetPkm?: ValidateSaveToMainSlot[ 'sourcePkm' ];
  attachedVariant?: Pick<PkmVariantDTO, 'id' | 'boxKey' | 'boxId' | 'boxSlot' | 'nickname'>;
};

export const validateMainToSave = (
  slotInfos: ValidateMainToSaveSlot,
  sourceForContext: PkmVariantDTO | undefined,
  sourceAttached: PkmVariantDTO | undefined,
  attached: boolean,
): DropValidationResult => {
  switch (slotInfos.mode) {
    case 'inventory':
      break;
    case 'default':
      if (slotInfos.targetBox && !slotInfos.targetBox.canSaveReceivePkm) {
        return {
          canDrop: false,
          reason: 'target-box-cannot-receive',
          slotInfos,
        };
      }

      if (slotInfos.targetSave && slotInfos.sourcePkm && !slotInfos.sourcePkm.compatibleWithVersions.includes(slotInfos.targetSave.displayedVersion)) {
        return {
          canDrop: false,
          reason: 'main-to-save-incompatible-version',
          slotInfos,
        };
      }

      if (slotInfos.sourcePkm && !(attached ? slotInfos.sourcePkm.canMoveAttachedToSave : slotInfos.sourcePkm.canMoveToSave)) {
        return {
          canDrop: false,
          reason: 'main-cannot-move-to-save',
          slotInfos,
        };
      }

      if (sourceForContext && !sourceForContext.isEnabled) {
        return {
          canDrop: false,
          reason: 'main-disabled-to-save',
          slotInfos,
        };
      }

      if (!sourceForContext && slotInfos.targetPkm) {
        return {
          canDrop: false,
          reason: 'main-no-variant-to-save-occupied',
          slotInfos,
        };
      }

      if (sourceAttached) {
        return {
          canDrop: false,
          reason: 'main-already-attached-to-save',
          slotInfos,
        };
      }
      break;
  }

  return { canDrop: true };
}
