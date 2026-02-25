import type { PkmVariantDTO } from '../../../../data/sdk/model';
import type { SlotInfosSlot } from '../slot-infos/build-slot-infos-slot';
import type { DropValidationResult } from '../types';

export const validateMainToSave = (
  slotInfos: Extract<SlotInfosSlot, { direction: 'main-to-save' }>,
  sourceForGeneration: PkmVariantDTO | undefined,
  sourceAttached: PkmVariantDTO | undefined,
  attached: boolean,
): DropValidationResult => {
  if (slotInfos.targetBox && !slotInfos.targetBox.canSaveReceivePkm) {
    return {
      canDrop: false,
      reason: 'target-box-cannot-receive',
      slotInfos,
    };
  }

  if (slotInfos.targetSave && !slotInfos.sourcePkm.compatibleWithVersions.includes(slotInfos.targetSave.version)) {
    return {
      canDrop: false,
      reason: 'main-to-save-incompatible-version',
      slotInfos,
    };
  }

  if (!(attached ? slotInfos.sourcePkm.canMoveAttachedToSave : slotInfos.sourcePkm.canMoveToSave)) {
    return {
      canDrop: false,
      reason: 'main-cannot-move-to-save',
      slotInfos,
    };
  }

  if (sourceForGeneration && !sourceForGeneration.isEnabled) {
    return {
      canDrop: false,
      reason: 'main-disabled-to-save',
      slotInfos,
    };
  }

  if (!sourceForGeneration && slotInfos.targetPkm) {
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

  return { canDrop: true };
}
