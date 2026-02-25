import type { SlotInfosBank } from './slot-infos/build-slot-infos-bank';
import type { SlotInfosSlot } from './slot-infos/build-slot-infos-slot';

export type SlotInfos = SlotInfosSlot | SlotInfosBank;

export type DropValidationResult =
    | { canDrop: true }
    | { canDrop: false; reason: DropRefusalReason; slotInfos: SlotInfos | undefined };

export type DropRefusalReason =
    | 'not-dragging'
    | 'empty-slot-infos'
    | 'out-of-bounds'
    | 'attached-target-occupied'
    | 'target-box-cannot-receive'
    | 'attached-main-to-main'
    | 'attached-save-to-save'
    | 'main-to-save-incompatible-version'
    | 'main-cannot-move-to-save'
    | 'main-disabled-to-save'
    | 'main-no-variant-to-save-occupied'
    | 'main-already-attached-to-save'
    | 'pkm-save-cannot-move'
    | 'save-to-pkm-save-cannot-move'
    | 'save-to-save-not-same-generation'
    | 'save-to-save-cannot-move'
    | 'save-egg-to-main'
    | 'save-shadow-to-main'
    | 'save-cannot-move-main-to-main'
    | 'save-to-main-variant-already-exist'
    | 'pkm-cannot-move'
    | 'main-to-same-bank'
    | 'same-pkm-id';
