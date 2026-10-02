import type { BoxDTO, InventoryItemDTO, PkmSaveDTO, SaveInfosDTO } from '../../../../data/sdk/model';
import type { DropValidationResult } from '../types';
import type { ValidateRootSlot } from './validate-root';

type Save = Pick<SaveInfosDTO, 'id' | 'context' | 'version'>;
type Box = Pick<BoxDTO, 'canSaveReceivePkm'>;
type Pkm = Pick<PkmSaveDTO, 'id' | 'canMove' | 'canMoveToSave'>;
type Item = Pick<InventoryItemDTO, 'id' | 'item' | 'version' | 'count'>;

export type ValidateSaveToSaveSlot = ValidateRootSlot & {
  direction: 'save-to-save';
  // sourceType: 'save';
  sourceSave: Save;
  sourceBox: Box;
  sourcePkm?: Pkm;
  sourceItem?: Item;
  targetSave: Save;
  targetBox: Box;
  targetPkm?: Pkm;
};

export const validateSaveToSave = (
  slotInfos: ValidateSaveToSaveSlot,
  attached: boolean,
): DropValidationResult => {
  switch (slotInfos.mode) {
    case 'inventory':
      break;
    case 'default':
      if (!slotInfos.targetBox.canSaveReceivePkm) {
        return {
          canDrop: false,
          reason: 'target-box-cannot-receive',
          slotInfos,
        };
      }

      if (attached) {
        return {
          canDrop: false,
          reason: 'attached-save-to-save',
          slotInfos,
        };
      }

      if (slotInfos.sourceSave.id !== slotInfos.targetSave.id) {
        if (slotInfos.sourcePkm && !slotInfos.sourcePkm.canMoveToSave) {
          return {
            canDrop: false,
            reason: 'pkm-save-cannot-move',
            slotInfos,
          };
        }

        if (slotInfos.targetPkm && !slotInfos.targetPkm.canMoveToSave) {
          return {
            canDrop: false,
            reason: 'save-to-pkm-save-cannot-move',
            slotInfos,
          };
        }
      }

      if (slotInfos.targetPkm && !slotInfos.targetPkm.canMove) {
        return {
          canDrop: false,
          reason: 'save-to-save-cannot-move',
          slotInfos,
        };
      }
      break;
  }

  if (slotInfos.sourcePkm && slotInfos.sourcePkm.id === slotInfos.targetPkm?.id) {
    return {
      canDrop: false,
      reason: 'same-pkm-id',
      slotInfos,
    };
  }

  if (slotInfos.sourceSave.context !== slotInfos.targetSave.context) {
    return {
      canDrop: false,
      reason: 'save-to-save-not-same-context',
      slotInfos,
    };
  }

  return { canDrop: true };
}
