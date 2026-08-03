import type { BankDTO, BoxDTO, PkmSaveDTO, PkmVariantDTO, SaveInfosDTO } from '../../../../data/sdk/model';
import type { DropValidationResult } from '../types';
import type { ValidateRootSlot } from './validate-root';

type Box = Pick<BoxDTO, 'canSaveReceivePkm'>;

export type ValidateSaveToMainSlot = ValidateRootSlot & {
  direction: 'save-to-main';
  sourceSave: Pick<SaveInfosDTO, 'version' | 'context'>;
  sourceBox: Box;
  sourcePkm: Pick<PkmSaveDTO, 'context' | 'idBase' | 'saveId' | 'isEgg' | 'isShadow' | 'canMoveAttachedToMain' | 'canMoveToMain'>;
  targetBox?: Box;
  targetPkm?: Pick<PkmVariantDTO, 'boxId' | 'canMoveToSave' | 'canMoveAttachedToSave' | 'compatibleWithVersions'>;
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

  return { canDrop: true };
}
