import type { BankDTO, BoxDTO, InventoryItemDTO, PkmSaveDTO, PkmVariantDTO, SaveInfosDTO } from '../../../../data/sdk/model';
import type { DropValidationResult } from '../types';
import type { ValidateRootSlot } from './validate-root';

type Box = Pick<BoxDTO, 'canSaveReceivePkm'>;

export type ValidateSaveToMainSlot = ValidateRootSlot & {
  direction: 'save-to-main';
  sourceSave: Pick<SaveInfosDTO, 'displayedVersion' | 'context'>;
  sourceBox: Box;
  sourcePkm?: Pick<PkmSaveDTO, 'context' | 'idBase' | 'saveId' | 'isEgg' | 'isShadow' | 'isDuplicate' | 'canMoveAttachedToMain' | 'canMoveToMain'>;
  sourceItem?: Pick<InventoryItemDTO, 'id' | 'item' | 'version' | 'count'>;
  targetBox?: Box;
  targetPkm?: Pick<PkmVariantDTO, 'id' | 'boxId' | 'boxKey' | 'canMoveToSave' | 'canMoveAttachedToSave' | 'compatibleWithVersions'>;
  targetPkmDuplicates?: Pick<PkmSaveDTO, 'id' | 'nickname' | 'boxId' | 'boxSlot'>[];
  attachedVariant?: Pick<PkmVariantDTO, 'id' | 'boxKey' | 'boxId' | 'boxSlot' | 'nickname'>;
};

export type ValidateSaveToMainBank = ValidateRootSlot
  & Pick<ValidateSaveToMainSlot, 'sourceSave' | 'sourceBox' | 'sourcePkm'>
  & {
    direction: 'save-to-bank';
    targetBank: Pick<BankDTO, 'isExternal'>;
    targetBox?: undefined;
    targetPkm?: undefined;
  };

export const validateSaveToMain = (
  slotInfos: ValidateSaveToMainSlot | ValidateSaveToMainBank,
  attached: boolean,
  targetVariants: PkmVariantDTO[],
): DropValidationResult => {
  switch (slotInfos.mode) {
    case 'inventory':
      break;
    case 'default':
      if (slotInfos.sourcePkm?.isShadow) {
        return { canDrop: false, reason: 'save-shadow-to-main', slotInfos };
      }

      if (slotInfos.sourcePkm && !(attached ? slotInfos.sourcePkm.canMoveAttachedToMain : slotInfos.sourcePkm.canMoveToMain)) {
        return {
          canDrop: false,
          reason: 'save-cannot-move-main-to-main',
          slotInfos,
        };
      }

      if (slotInfos.sourcePkm && slotInfos.attachedVariant) {
        if (slotInfos.sourcePkm.isDuplicate && slotInfos.targetPkm?.boxKey !== slotInfos.attachedVariant.boxKey)
          return {
            canDrop: false,
            reason: 'save-pkm-attached-duplicate-to-main',
            slotInfos,
          };

        if (slotInfos.targetPkm && slotInfos.targetPkm?.boxKey !== slotInfos.attachedVariant.boxKey)
          return {
            canDrop: false,
            reason: 'save-pkm-attached-to-main-pkm',
            slotInfos,
          };
      }

      if (slotInfos.sourcePkm && targetVariants.length > 1 && (!slotInfos.attachedVariant || !targetVariants.some(v => v.id === slotInfos.attachedVariant?.id)))
        return {
          canDrop: false,
          reason: 'save-to-main-multiple-variants',
          slotInfos,
        };

      break;
  }

  if (slotInfos.sourcePkm?.isEgg) {
    return { canDrop: false, reason: 'save-egg-to-main', slotInfos };
  }

  return { canDrop: true };
}
