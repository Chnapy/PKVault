export type MoveSource = {
    ids: string[];
    saveId?: number;
    attached?: boolean;
};

type MoveTargetSlot = { type: 'slot'; saveId?: number; boxId: number; boxSlots: number[] };
type MoveTargetBank = { type: 'bank'; bankId: string };
export type MoveTarget = MoveTargetSlot | MoveTargetBank;

export type MoveState =
    | { status: 'idle' }
    | { status: 'dragging'; source: MoveSource }
    | { status: 'loading'; source: MoveSource; target: MoveTarget };

export type MoveAction =
    | { type: 'START_DRAG'; source: MoveSource }
    | { type: 'DROP_ON_SLOT'; target: MoveTargetSlot }
    | { type: 'DROP_ON_BANK'; target: MoveTargetBank }
    | { type: 'COMPLETE' }
    | { type: 'CANCEL' };
