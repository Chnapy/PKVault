import { ActionIcon, Divider, Flex, Group, NumberFormatter, Stack, Text } from '@mantine/core';
import { BoxIcon, ExternalLinkIcon, PenIcon, StarIcon, TrashIcon } from 'lucide-react';
import type React from 'react';
import { UIConfirmPopover } from '../confirm-popover/ui-confirm-popover';
import { UIPopover } from '../confirm-popover/ui-popover';
import { UIBallIcon } from '../icon/ui-ball-icon';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../interaction/focus-controls/common-controls/drag-controls';
import { getSelectControl } from '../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../interaction/focus-controls/use-focus-controls';
import { useDragSubmitting } from '../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../interaction/move/hooks/use-droppable';
import { UISubHeaderTab } from '../layout/header/sub-header/ui-sub-header-tab';
import type { UIBankItemProps } from './ui-bank-item';

export type UIBankExpandedProps = UIBankItemProps
    & {
        selected?: boolean;
        loading?: boolean;
        onSelect: () => void;
        onDelete?: () => void;
        boxCount: number;
        pkmCount: number;
        editDropdown: React.ReactNode;
    };

export const UIBankExpanded: React.FC<UIBankExpandedProps> = ({
    to, search,
    id, container, isDefault, isExternal,
    label, boxCount, pkmCount,
    selected, loading, onSelect, onDelete,
    editDropdown,
}) => {
    const droppable = useDroppable({
        targetContainer: container,
        targetPosition: -1,
        targetId: undefined,
    });

    const nodeId = `bank-expanded-${id}`;

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: nodeId,
        onFocus: ({ node }) => {
            droppable.focusNode(node);
        },
        controls: [
            getSelectControl({
                label: 'Select',
                action: () => {
                    onSelect();
                },
            }),
            {
                name: 'delete' as const,
                label: 'Delete',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    },
                },
                spread: false,
                action: () => {
                    // TODO trigger click on action-icon
                },
            },
            ...getDragControls({ droppable }),
        ],
    });

    const submitting = useDragSubmitting(container, -1);
    loading ||= submitting;

    return <WithControlsIcons
        placement='out' icons={[
            controlsIcons.open,
            controlsIcons.drop
        ]}
        as={Group} gap='xs'
    >
        <UISubHeaderTab
            id={id}
            label={label}
            to={to}
            search={search}
            py='md'
            {...focusControlProps}
            onClick={droppable.onClick} // override focusControl onClick to keep link enabled
            onPointerUp={droppable.onPointerUp ?? focusControlProps.onPointerUp}
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
                <ActionIcon color='blue' disabled={!editDropdown} opacity={!editDropdown ? 0.5 : undefined}>
                    <PenIcon />
                </ActionIcon>
            </UIPopover>

            <UIConfirmPopover
                label='Delete'
                action={onDelete}
            >
                <WithControlsIcons placement='out' icons={controlsIcons.delete}>
                    <ActionIcon color='red' disabled={selected || !onDelete} opacity={selected || !onDelete ? 0.5 : undefined}>
                        <TrashIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIConfirmPopover>
        </ActionIcon.Group>
    </WithControlsIcons>;
};
