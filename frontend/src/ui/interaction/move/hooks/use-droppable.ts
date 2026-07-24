import type React from 'react';
import { useShallow } from 'zustand/shallow';
import type { DropRefusalReason } from '../../../../storage/move/validation/types';
import type { MoveTargetInput } from '../context/move-context';
import { useMoveContext } from '../context/use-move-context';
import { useDragUtils, type DragUtils } from './use-drag-utils';

export type UseDroppableReturn = DragUtils & {
    isDroppable: boolean;
    canDrop?: boolean;
    helpText?: string;
    _disabledReason?: DropRefusalReason;
    onDrop?: (e: Event | React.BaseSyntheticEvent) => Promise<unknown>;
    onClick?: (e: React.MouseEvent<never, MouseEvent>) => Promise<unknown>;
    onPointerUp?: (e: React.PointerEvent<never>) => Promise<unknown>;
};

/**
 * Estimate if given position can receive currently moving entity.
 * If no moving entity, do nothing.
 */
export const useDroppable = <C>(target: MoveTargetInput<C>): UseDroppableReturn => {
    const { useMoveStore, drop, getContainerHash } = useMoveContext<C>();

    const dragUtils = useDragUtils();

    const targetContainerHash = getContainerHash(target.targetContainer);

    const { isDroppable, canDrop, helpText, _disabledReason, clickable, pointerUp } = useMoveStore(useShallow(({ state }) => {
        if (state.status !== 'dragging')
            return {
                isDroppable: false,
                clickable: false,
                pointerUp: false,
            };

        const slotState = target.targetPosition === -1
            ? state.slotsStates.rootItems[ targetContainerHash ]
            : state.slotsStates.items[ targetContainerHash ]?.[ target.targetPosition.toString() ];
        if (!slotState) {
            console.log('not found', targetContainerHash, target.targetPosition, state.slotsStates.items)
            return {
                isDroppable: true,
                clickable: false,
                pointerUp: false,
            };
        }

        if (!slotState.canDrop)
            return {
                isDroppable: true,
                canDrop: false,
                helpText: slotState.helpText,
                _disabledReason: slotState._disabledReason as DropRefusalReason | undefined,
                clickable: false,
                pointerUp: false,
            };

        return {
            isDroppable: true,
            canDrop: true,
            clickable: state.trigger !== 'drag',
            pointerUp: state.trigger === 'drag',
        };
    }));

    if (!isDroppable) {
        return {
            ...dragUtils,
            isDroppable: false,
        };
    }

    if (!canDrop)
        return {
            ...dragUtils,
            isDroppable: true,
            canDrop: false,
            helpText,
            _disabledReason,
        };

    const onDrop = () => {
        return drop(target);
    };

    return {
        ...dragUtils,
        isDroppable: true,
        canDrop: true,
        onDrop,
        onClick: clickable ? onDrop : undefined,
        onPointerUp: pointerUp ? onDrop : undefined,
    };
};
