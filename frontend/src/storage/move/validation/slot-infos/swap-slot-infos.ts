import type { SlotInfosSlot } from './build-slot-infos-slot';

export const swapSlotInfos = (slotInfos: SlotInfosSlot): SlotInfosSlot => {

    switch (slotInfos.direction) {
        case 'main-to-main': {
            return {
                direction: 'main-to-main',
                mode: slotInfos.mode,
                sourceBox: slotInfos.targetBox,
                sourcePkm: slotInfos.targetPkm!,
                targetBox: slotInfos.targetBox,
                targetPkm: slotInfos.sourcePkm,
                targetSlot: slotInfos.sourcePkm?.boxSlot ?? slotInfos.sourceItem?.boxSlot,
            };
        };
        case 'main-to-save': {
            return {
                direction: 'save-to-main',
                mode: slotInfos.mode,
                sourceSave: slotInfos.targetSave,
                sourcePkm: slotInfos.targetPkm!,
                sourceBox: slotInfos.targetBox!,
                targetPkm: slotInfos.sourcePkm,
                targetBox: slotInfos.sourceBox,
                targetSlot: slotInfos.sourcePkm?.boxSlot ?? slotInfos.sourceItem?.boxSlot,
            };
        };
        case 'save-to-main': {
            return {
                direction: 'main-to-save',
                mode: slotInfos.mode,
                sourcePkm: slotInfos.targetPkm!,
                sourceBox: slotInfos.targetBox!,
                targetPkm: slotInfos.sourcePkm,
                targetBox: slotInfos.sourceBox,
                targetSlot: slotInfos.sourcePkm?.boxSlot ?? slotInfos.sourceItem?.boxSlot,
                targetSave: slotInfos.sourceSave,
            };
        };
        case 'save-to-save': {
            return {
                direction: 'save-to-save',
                mode: slotInfos.mode,
                sourcePkm: slotInfos.targetPkm!,
                sourceBox: slotInfos.targetBox,
                sourceSave: slotInfos.targetSave,
                targetPkm: slotInfos.sourcePkm,
                targetBox: slotInfos.sourceBox,
                targetSave: slotInfos.sourceSave,
                targetSlot: slotInfos.sourcePkm?.boxSlot ?? slotInfos.sourceItem?.boxSlot,
            };
        };
    }

};
