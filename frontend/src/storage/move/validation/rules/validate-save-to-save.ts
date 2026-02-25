import type { SlotInfosSlot } from '../slot-infos/build-slot-infos-slot';
import type { DropValidationResult } from '../types';

export const validateSaveToSave = (
  slotInfos: Extract<SlotInfosSlot, { direction: 'save-to-save' }>,
  attached: boolean,
): DropValidationResult => {
  if (slotInfos.sourcePkm.id === slotInfos.targetPkm?.id) {
    return {
      canDrop: false,
      reason: 'same-pkm-id',
      slotInfos,
    };
  }

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
    if (!slotInfos.sourcePkm.canMoveToSave) {
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

  if (slotInfos.sourceSave.generation !== slotInfos.targetSave.generation) {
    return {
      canDrop: false,
      reason: 'save-to-save-not-same-generation',
      slotInfos,
    };
  }

  if (slotInfos.targetPkm && !slotInfos.targetPkm.canMove) {
    return {
      canDrop: false,
      reason: 'save-to-save-cannot-move',
      slotInfos,
    };
  }

  return { canDrop: true };
}
