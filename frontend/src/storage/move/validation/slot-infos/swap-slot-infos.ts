import type { SlotInfosSlot } from './build-slot-infos-slot';

export const swapSlotInfos = (slotInfos: SlotInfosSlot): SlotInfosSlot => {

    switch (slotInfos.direction) {
        case 'main-to-main': {
            return {
                direction: 'main-to-main',
                sourceType: 'main',
                sourcePkm: slotInfos.targetPkm!,
                sourceBox: slotInfos.targetBox,
                targetPkm: slotInfos.sourcePkm,
                targetBox: slotInfos.sourceBox,
                targetSlot: slotInfos.sourcePkm.boxSlot,
            };
        };
        case 'main-to-save': {
            return {
                direction: 'save-to-main',
                sourceType: 'save',
                sourcePkm: slotInfos.targetPkm!,
                sourceBox: slotInfos.targetBox,
                sourceSave: slotInfos.targetSave,
                targetPkm: slotInfos.sourcePkm,
                targetBox: slotInfos.sourceBox,
                targetSlot: slotInfos.sourcePkm.boxSlot,
            };
        };
        case 'save-to-main': {
            return {
                direction: 'main-to-save',
                sourceType: 'main',
                sourcePkm: slotInfos.targetPkm!,
                sourceBox: slotInfos.targetBox,
                targetPkm: slotInfos.sourcePkm,
                targetBox: slotInfos.sourceBox,
                targetSlot: slotInfos.sourcePkm.boxSlot,
                targetSave: slotInfos.sourceSave,
            };
        };
        case 'save-to-save': {
            return {
                direction: 'save-to-save',
                sourceType: 'save',
                sourcePkm: slotInfos.targetPkm!,
                sourceBox: slotInfos.targetBox,
                sourceSave: slotInfos.targetSave,
                targetPkm: slotInfos.sourcePkm,
                targetBox: slotInfos.sourceBox,
                targetSlot: slotInfos.sourcePkm.boxSlot,
                targetSave: slotInfos.sourceSave,
            };
        };
    }

};
