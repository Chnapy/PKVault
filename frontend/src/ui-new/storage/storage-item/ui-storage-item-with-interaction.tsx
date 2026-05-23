import { type BoxProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
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
import { UIStorageItem, type UIStorageItemProps } from './ui-storage-item';

type ContainerValue = {
    bank: string;
    saveId: number | null;
    box: number;
};

export type UIStorageItemWithInteractionProps = Pick<UIStorageItemProps, 'ref' | 'label' | 'icons' | 'onClick' | 'children'>
    & ContainerValue
    & {
        id: string;
        slot: number;
    }
    & BoxProps;

export const UIStorageItemWithInteraction: React.FC<UIStorageItemWithInteractionProps> = ({
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

    const { focusControlProps } = useFocusControls({
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
            {
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

    const render = (props: Partial<UIStorageItemProps>) => <UIStorageItem
        checked={checked}
        onCheck={() => checked ? removeId([ id ]) : addId(container, [ id ])}
        label={label}
        icons={icons}

        {...boxProps}
        {...props}
    >{children}</UIStorageItem>;

    return <>
        {render({
            // disabled: dragging.isDragging,
            loading: submitting,
            ...focusControlProps,
            ref,
        })}

        {dragging.isDragging && <DragRender elementRef={dragging.ref}>
            {render({
                dragging: true,
            })}
        </DragRender>}
    </>;
};
