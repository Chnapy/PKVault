import { Checkbox } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import type { MoveParams } from '../../../storage/move/move-container-fns';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { useDragControls } from '../../interaction/focus-controls/common-controls/drag-controls';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { DragRender } from '../../interaction/move/components/drag-render';
import { useDragSubmitting } from '../../interaction/move/hooks/use-drag-submitting';
import { useDragging } from '../../interaction/move/hooks/use-dragging';
import { useDroppable } from '../../interaction/move/hooks/use-droppable';
import { useSelectContextActions, useSelectHasValue } from '../../interaction/select/context/use-select-context';
import { useCurrentPanel } from '../storage-content/context/ui-panel-context';
import { UIDetailsLevel } from '../storage-details/ui-details-level';
import { UIStorageItemBase } from './base/ui-storage-item-base';
import type { UIStorageItemPlaceholderProps } from './placeholder/ui-storage-item-placeholder';
import classes from './ui-storage-item.module.css';

export type UIStorageItemProps<C = unknown> =
    & UIStorageItemPlaceholderProps<C>
    & {
        id: string;
        name: string;
        selected?: boolean;
        level: number;
        icons?: React.ReactNode;
    };

export const UIStorageItem: React.FC<UIStorageItemProps> = ({
    ref: refRoot, id, nodeId, slot, globalOrder, icons,
    container, selected,
    name, level, label,
    loading, disabled, onClick,
    children, ...buttonProps
}) => {
    const { t } = useTranslate();

    const panel = useCurrentPanel();

    const checked = useSelectHasValue(container, [ id ]);
    const { addId, removeId } = useSelectContextActions();

    const dragging = useDragging(id, container);
    const draggingMove = dragging.useDrag();
    const draggingMoveAttached = dragging.useDrag<MoveParams>({ attached: true });

    const droppable = useDroppable({
        targetContainer: container,
        targetPosition: slot,
        targetId: id,
    });

    const isDraggingState = dragging.isDragging || droppable.isDroppable;

    const submitting = useDragSubmitting(container, slot, id);

    disabled ||= droppable.canDrop === false;
    loading ||= submitting;

    const dragControls = useDragControls({
        dragging,
        draggingMove,
        draggingMoveAttached,
        droppable,
        disabled: disabled || loading,
    });

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: nodeId,
        order: globalOrder,
        onFocus: ({ node }) => {
            dragging.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            !isDraggingState && !disabled && !loading && getSelectControl({
                label: t('action.open'),
                action: e => {
                    onClick?.(e);
                },
            }),
            ...dragControls,
            !isDraggingState && !disabled && !loading && {
                name: 'select',
                label: t('action.select'),
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    },
                },
                spread: true,
                action: () => checked ? removeId([ id ]) : addId(container, [ id ]),
            },
        ],
    });

    const ref = useMergedRef(
        dragging.ref,
        focusProps.ref,
        refRoot,
    );

    React.useEffect(() => {
        if (selected)
            dragging.ref.current?.scrollIntoView({
                behavior: 'instant',
                block: 'center',
                inline: 'center',
            });
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return <>
        <WithControlsIcons
            placement='out' icons={controlIcons('open', 'drag', 'drag-attached', 'drop')}
            className={classes.uiStorageItem}
        >
            <UIStorageItemBase
                label={droppable.helpText ?? <>
                    {name}
                    <UIDetailsLevel level={level} showBar />
                </>}
                selected={selected}
                loading={loading}
                {...focusProps}
                {...controlProps('open', 'drag', 'drag-attached', 'drop')}
                {...buttonProps}
                ref={ref}
            >
                {children}
                {icons}
            </UIStorageItemBase>

            {(controlProps('select').onClick || checked) && <WithControlsIcons className={classes.checkbox} placement='out' icons={controlIcons('select')}>
                <Checkbox
                    size='sm'
                    checked={checked}
                    {...controlProps('select')}
                />
            </WithControlsIcons>}
        </WithControlsIcons>

        {dragging.isDragging && <DragRender elementRef={dragging.ref}>
            <UIStorageItemBase
                opacity={0.75}
            >
                {children}
            </UIStorageItemBase>
        </DragRender>}
    </>;
};
