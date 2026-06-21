import { ActionIcon, Divider, Flex, Group, NumberFormatter, Stack, Text } from '@mantine/core';
import { BoxIcon, ExternalLinkIcon, PenIcon, StarIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { UIBallIcon } from '../icon/ui-ball-icon';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../interaction/focus-controls/common-controls/drag-controls';
import { getSelectControl } from '../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../interaction/focus-controls/use-focus-controls';
import { useDragSubmitting } from '../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../interaction/move/hooks/use-droppable';
import { UISubHeaderTab } from '../layout/header/sub-header/ui-sub-header-tab';
import { UIConfirmPopover } from '../popover/ui-confirm-popover';
import { UIPopover } from '../popover/ui-popover';
import type { UIBankItemProps } from './ui-bank-item';

export type UIBankExpandedProps = UIBankItemProps
    & {
        selected?: boolean;
        loading?: boolean;
        onDelete?: () => void;
        boxCount: number;
        pkmCount: number;
        editDropdown: React.ReactNode;
    };

export const UIBankExpanded: React.FC<UIBankExpandedProps> = ({
    to, search,
    id, container, isDefault, isExternal,
    label, boxCount, pkmCount,
    selected, loading, onDelete,
    editDropdown,
}) => {
    const droppable = useDroppable({
        targetContainer: container,
        targetPosition: -1,
        targetId: undefined,
    });

    const nodeId = `bank-expanded-${id}`;

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: nodeId,
        focusOnMount: selected,
        onFocus: ({ node }) => {
            droppable.focusNode(node);
        },
        controls: [
            !selected && getSelectControl({
                label: 'Select',
            }),
            !!editDropdown && {
                name: 'edit' as const,
                label: 'Edit',
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    },
                },
                spread: false,
            },
            !selected && onDelete && {
                name: 'delete' as const,
                label: 'Delete',
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
                spread: false,
            },
            ...getDragControls({ droppable }),
        ],
    });

    const submitting = useDragSubmitting(container, -1);
    loading ||= submitting;

    return <WithControlsIcons
        placement='out' icons={[ controlIcons('open', 'drop') ]}
        as={Group} gap='xs'
    >
        <UISubHeaderTab
            id={id}
            label={label}
            to={to}
            search={search}
            py='md'
            {...focusProps}
            {...controlProps('open', 'drop')}
            onClick={droppable.onClick} // override focusControl onClick to keep link enabled
            onPointerUp={droppable.onPointerUp ?? controlProps('drop').onPointerUp}
            loading={loading}
        >
            <Stack>
                <Text span lh={1} mx='auto'>
                    <Group component='span'>
                        {label}
                        {isDefault && <StarIcon />}
                        {isExternal && <ExternalLinkIcon />}
                    </Group>
                </Text>
                <Text component='div' lh={1}>
                    <Group align='center'>
                        <Flex gap='sm'>
                            <BoxIcon />
                            <NumberFormatter value={boxCount} />
                        </Flex>
                        <Divider orientation='vertical' />
                        <Flex gap='sm'>
                            <UIBallIcon />
                            <NumberFormatter value={pkmCount} />
                        </Flex>
                    </Group>
                </Text>
            </Stack>
        </UISubHeaderTab>

        <ActionIcon.Group orientation="vertical">
            <UIPopover
                dropdown={editDropdown}
            >
                <WithControlsIcons
                    placement='in' icons={controlIcons('edit')}
                    as={ActionIcon<'button'>}
                    color='blue'
                    {...controlProps('edit')}
                >
                    <PenIcon />
                </WithControlsIcons>
            </UIPopover>

            <UIConfirmPopover
                label='Delete'
                color='red'
                action={onDelete}
            >
                <WithControlsIcons
                    placement='in' icons={controlIcons('delete')}
                    as={ActionIcon<'button'>}
                    color='red'
                    {...controlProps('delete')}
                >
                    <TrashIcon />
                </WithControlsIcons>
            </UIConfirmPopover>
        </ActionIcon.Group>
    </WithControlsIcons>;
};
