import { Box, Button, Checkbox, Tooltip, type BoxProps, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
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
import classes from './ui-storage-item.module.css';

type ContainerValue = {
    bank: string;
    saveId: number | null;
    box: number;
};

type UIStorageItemInnerProps = Pick<Button.Props, 'loading' | 'disabled'>
    & Pick<ElementProps<'button'>, 'ref' | 'onClick' | 'onPointerDown' | 'onPointerUp' | 'children'>
    & {
        label: string;
        icons: React.ReactNode;
        dragging?: boolean;
    } & BoxProps;

export type UIStorageItemProps = Pick<UIStorageItemInnerProps, 'ref' | 'label' | 'icons' | 'onClick' | 'children'>
    & ContainerValue
    & {
        id: string;
        slot: number;
    }
    & BoxProps;

export const UIStorageItem: React.FC<UIStorageItemProps> = ({
    ref: refRoot, id, slot,
    bank, saveId, box,
    label, icons, onClick,
    children, ...boxProps
}) => {
    // console.log('item', box, id)
    // const { pushScope } = Focus.usePushPopScope();

    const panel = useCurrentPanel();

    const setPopover = usePopover();

    const container: ContainerValue = { bank, saveId, box };

    const checked = useSelectHasValue<ContainerValue>(container, [ id ]);
    const { addId, removeId } = useSelectContextActions<ContainerValue>();

    const dragging = useDragging<ContainerValue>(id, container);

    const droppable = useDroppable<ContainerValue>({
        targetContainer: container,
        targetPosition: slot,
        targetId: id,
    });

    const submitting = useDragSubmitting<ContainerValue>(container, slot, id);

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: id,
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
            ...getDragControls({ dragging, droppable }),
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

    const render = ({ ref, onClick, onPointerDown, onPointerUp, loading, disabled, dragging, ...rest }: Partial<UIStorageItemInnerProps>) => {

        const button = <Button
            ref={ref}
            variant='light'
            className={classes.button}
            onClick={onClick}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            loading={loading}
            disabled={disabled}
            bd='none'
            opacity={dragging ? 0.75 : undefined}
        >
            {children}
            <Box className={classes.icons}>
                {icons}
            </Box>
        </Button>;


        return <Box
            className={classes.uiStorageItem}
            {...boxProps}
            {...rest}
        >
            {dragging
                ? button
                : <Tooltip label={label} withArrow position="bottom">
                    {button}
                </Tooltip>}

            {!loading && !disabled && !dragging && <WithControlsIcons className={classes.checkbox} placement='out' icons={controlsIcons.select}>
                <Checkbox
                    size='sm'
                    checked={checked}
                    onClick={() => checked ? removeId([ id ]) : addId(container, [ id ])}
                />
            </WithControlsIcons>}
        </Box>;
    };

    return <>
        <WithControlsIcons placement='out' icons={[
            controlsIcons.open,
            controlsIcons.drag,
            controlsIcons[ 'drag-attached' ],
            controlsIcons.drop,
        ]}>
            {render({
                // disabled: dragging.isDragging,
                loading: submitting,
                ...focusControlProps,
                ref,
            })}
        </WithControlsIcons>

        {dragging.isDragging && <DragRender elementRef={dragging.ref}>
            {render({
                dragging: true,
            })}
        </DragRender>}
    </>;
};
