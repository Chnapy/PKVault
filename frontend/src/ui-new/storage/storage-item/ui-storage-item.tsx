import { Box, Button, Checkbox, Group, Tooltip, type BoxProps, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import type { MoveParams } from '../../../storage/move/state/move-select-impl-provider';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../../interaction/focus-controls/common-controls/drag-controls';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { usePopover } from '../../interaction/focus-controls/components/popover/hooks/use-popover';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { DragRender } from '../../interaction/move/components/drag-render';
import { useDragSubmitting } from '../../interaction/move/hooks/use-drag-submitting';
import { useDragging } from '../../interaction/move/hooks/use-dragging';
import { useDroppable } from '../../interaction/move/hooks/use-droppable';
import { useSelectContextActions, useSelectHasValue } from '../../interaction/select/context/use-select-context';
import { useCurrentPanel } from '../storage-content/context/ui-panel-context';
import { UIDetailsLevel } from '../storage-details/ui-details-level';
import classes from './ui-storage-item.module.css';

export type UIStorageItemProps<C = unknown> =
    & {
        id: string;
        nodeId: string;
        container: C;
        slot: number;
        name: string;
        level: number;
        label?: React.ReactNode;
        icons?: React.ReactNode;
    }
    & Pick<Button.Props, 'loading' | 'disabled'>
    & Pick<ElementProps<'button'>, 'ref' | 'onClick' | 'children'>
    & BoxProps;

export const UIStorageItem: React.FC<UIStorageItemProps> = ({
    ref: refRoot, id, nodeId, slot, icons,
    container,
    name, level, label, onClick,
    disabled,
    children, ...boxProps
}) => {
    // console.log('item', box, id)
    // const { pushScope } = Focus.usePushPopScope();

    const panel = useCurrentPanel();

    const setPopover = usePopover();

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

    disabled ||= (isDraggingState && !droppable.isDroppable);

    const submitting = useDragSubmitting(container, slot, id);

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: nodeId,
        onFocus: ({ node }) => {
            dragging.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            getSelectControl({
                label: 'Open',
                action: e => {
                    setPopover?.(s => ({
                        opened: !s.opened,
                    }));
                    onClick?.(e);
                },
            }),
            ...getDragControls({ dragging, draggingMove, draggingMoveAttached, droppable }),
            !dragging.isDragging && !droppable.isDroppable && {
                name: 'select',
                label: 'Select',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                        allowOnFocus: true,
                    },
                },
                spread: false,
                action: () => checked ? removeId([ id ]) : addId(container, [ id ]),
            },
        ],
    });

    const ref = useMergedRef(
        dragging.ref,
        focusControlProps.ref,
        refRoot,
    );

    return <>
        <WithControlsIcons placement='out' icons={[
            controlsIcons.open,
            controlsIcons.drag,
            controlsIcons[ 'drag-attached' ],
            controlsIcons.drop,
        ]}>
            <Box
                className={classes.uiStorageItem}
                {...boxProps}
            >
                <Tooltip
                    position="bottom"
                    withArrow
                    label={<Group fz='md' gap='sm' px='sm'>
                        {label ?? <>
                            {name}
                            <UIDetailsLevel level={level} />
                        </>}
                    </Group>}
                >
                    <Button
                        {...focusControlProps}
                        ref={ref}
                        variant='light'
                        className={classes.button}
                        loading={submitting}
                        disabled={disabled}
                        bd='none'
                        opacity={dragging.isDragging ? 0.5 : undefined}
                    >
                        {children}
                        {icons}
                    </Button>
                </Tooltip>

                {!submitting && !disabled && <WithControlsIcons className={classes.checkbox} placement='out' icons={controlsIcons.select}>
                    <Checkbox
                        size='sm'
                        checked={checked}
                        onClick={() => checked ? removeId([ id ]) : addId(container, [ id ])}
                    />
                </WithControlsIcons>}
            </Box>
        </WithControlsIcons>

        {dragging.isDragging && <DragRender elementRef={dragging.ref}>
            <Box
                className={classes.uiStorageItem}
                {...boxProps}
            >
                <Button
                    variant='light'
                    className={classes.button}
                    bd='none'
                    opacity={0.75}
                >
                    {children}
                </Button>
            </Box>
        </DragRender>}
    </>;
};
