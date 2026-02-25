import type { PkmVariantDTO } from '../../../../data/sdk/model';
import type { DropValidationResult, SlotInfos } from '../types';

export const validateSaveToMain = (
  slotInfos: Extract<SlotInfos, { sourceType: 'save' }>,
  attached: boolean,
  existingVariant: PkmVariantDTO | undefined,
): DropValidationResult => {
  if (slotInfos.sourcePkm.isEgg) {
    return { canDrop: false, reason: 'save-egg-to-main', slotInfos };
  }

  if (slotInfos.sourcePkm.isShadow) {
    return { canDrop: false, reason: 'save-shadow-to-main', slotInfos };
  }

  if (!(attached ? slotInfos.sourcePkm.canMoveAttachedToMain : slotInfos.sourcePkm.canMoveToMain)) {
    return {
      canDrop: false,
      reason: 'save-cannot-move-main-to-main',
      slotInfos,
    };
  }

  if (existingVariant && existingVariant.attachedSaveId !== slotInfos.sourcePkm.saveId) {
    return {
      canDrop: false,
      reason: 'save-to-main-variant-already-exist',
      slotInfos,
    };
  }

  return { canDrop: true };
}
