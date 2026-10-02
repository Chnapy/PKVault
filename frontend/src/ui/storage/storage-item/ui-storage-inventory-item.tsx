import { Box, Checkbox, useMatches, type MantineSize } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { useDragControls } from '../../interaction/focus-controls/common-controls/drag-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { DragRender } from '../../interaction/move/components/drag-render';
import { useDragSubmitting } from '../../interaction/move/hooks/use-drag-submitting';
import { useDragging } from '../../interaction/move/hooks/use-dragging';
import { useDroppable } from '../../interaction/move/hooks/use-droppable';
import { useSelectContextActions, useSelectHasValue } from '../../interaction/select/context/use-select-context';
import { useCurrentPanel } from '../storage-content/context/ui-panel-context';
import { UIStorageItemBase } from './base/ui-storage-item-base';
import type { UIStorageInventoryItemPlaceholderProps } from './placeholder/ui-storage-inventory-item-placeholder';
import classes from './ui-storage-item.module.css';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';

export type UIStorageInventoryItemProps<C = unknown> =
    & UIStorageInventoryItemPlaceholderProps<C>
    & {
        id: string;
        name: string;
        selected?: boolean;
        count: number;
        selectFromPreviousSelected: (id: string) => void;
    };

export const UIStorageInventoryItem: React.FC<UIStorageInventoryItemProps> = ({
    ref: refRoot, id, nodeId, slot,
    globalOrder, container,
    selected, selectFromPreviousSelected,
    name, count, label,
    loading, disabled, onClick,
    children, ...buttonProps
}) => {
    const { t } = useTranslate();

    const panel = useCurrentPanel();

    const checked = useSelectHasValue(container, [ id ]);
    const { addId, removeId } = useSelectContextActions();

    const dragging = useDragging(id, container);
    const draggingMove = dragging.useDrag();

    const droppable = useDroppable({
        targetContainer: container,
        targetPosition: slot,
        targetId: id,
    });

    const isDraggingState = dragging.isDragging || droppable.isDroppable;

    const submitting = useDragSubmitting(container, slot, id);

    disabled ||= droppable.canDrop === false || (!isDraggingState && !draggingMove.enabled);
    loading ||= submitting;

    const dragControls = useDragControls({
        dragging,
        draggingMove,
        droppable,
        disabled: disabled || loading,
    });

    const selectFn = (e: unknown) => {
        if (checked) {
            removeId([ id ]);
        } else {
            const shiftKey = typeof e === 'object' && !!e && (e as React.MouseEvent).shiftKey;
            if (shiftKey) {
                selectFromPreviousSelected(id);
            } else {
                addId(container, [ id ]);
            }
        }
    };

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: nodeId,
        order: globalOrder,
        onFocus: ({ node }) => {
            dragging.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            !isDraggingState && !disabled && !loading && getSelectControl({
                label: t('action.select'),
                action: e => {
                    selectFn(e);
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
                action: (e) => {
                    selectFn(e);
                },
            },
        ],
    });

    const ref = useMergedRef(
        dragging.ref,
        focusProps.ref,
        refRoot,
    );

    const checkboxSize = useMatches<MantineSize>({
        base: 'xs',
        sm: 'sm',
    });

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
            placement='out'
            icons={controlIcons('open', 'drag', 'drop')}
            className={classes.uiStorageItem}
        >
            <UIStorageItemBase
                label={droppable.helpText ?? <>
                    {name}
                </>}
                selected={selected}
                loading={loading}
                {...focusProps}
                {...controlProps('open', 'drag', 'drop')}
                disabled={disabled || loading}
                {...buttonProps}
                ref={ref}
            >
                {children}

                <Box pos='absolute' bottom={4} right={4}>
                    {count}
                </Box>
            </UIStorageItemBase>

            {(controlProps('select').onClick || checked) && <WithControlsIcons className={classes.checkbox} placement='out' icons={controlIcons('select')}>
                <Checkbox
                    size={checkboxSize}
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
