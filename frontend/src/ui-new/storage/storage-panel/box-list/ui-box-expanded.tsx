import { ActionIcon, Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { PenIcon, TrashIcon } from 'lucide-react';
import type React from 'react';
import { UIConfirmPopover } from '../../../confirm-popover/ui-confirm-popover';
import { UIPopover } from '../../../confirm-popover/ui-popover';
import type { UIExpandableTabsData } from '../../../expandable-tabs/ui-expandable-tabs';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { getBoxColumns } from '../get-box-columns';
import classes from './ui-box-expanded.module.css';

export type UIBoxExpandedProps = UIExpandableTabsData & {
    slotsStates: boolean[];
    selected: boolean;
    onSelect: () => void;
    onDelete?: () => void;
    editDropdown: React.ReactNode;
};

export const UIBoxExpanded: React.FC<UIBoxExpandedProps> = ({
    id, label, selected, slotsStates, onSelect, onDelete, editDropdown
}) => {
    const cols = getBoxColumns(slotsStates.length);

    const nodeId = `box-expanded-${id}`;

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: nodeId,
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
        ],
    });

    return <Group gap='xs' align='stretch' style={{ alignSelf: 'flex-start' }}>
        <Button
            style={{ gap: 4 }}
            variant='default'
            disabled={selected}
            {...focusControlProps}
            h='auto'
            p='md'
            pt={0}
        >
            <Stack gap='xs' style={{ alignSelf: 'flex-start' }}>
                <Text component={selected ? 'b' : undefined}>{label}</Text>

                <SimpleGrid
                    className={classes.slotsContainer}
                    cols={cols ?? 6}
                    spacing={2}
                    p='sm'
                    w='fit-content'
                    mx='auto'
                >
                    {slotsStates.map((state, i) => <span
                        key={i}
                        data-enabled={state || undefined}
                    />)}
                </SimpleGrid>
            </Stack>
        </Button>

        <ActionIcon.Group orientation="vertical">
            <UIPopover
                dropdown={editDropdown}
            >
                <ActionIcon color='blue' disabled={!editDropdown}>
                    <PenIcon />
                </ActionIcon>
            </UIPopover>

            <UIConfirmPopover
                label='Delete'
                action={onDelete}
            >
                <WithControlsIcons placement='out' icons={controlsIcons.delete}>
                    <ActionIcon color='red' disabled={selected || !onDelete}>
                        <TrashIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIConfirmPopover>
        </ActionIcon.Group>
    </Group>;
};
