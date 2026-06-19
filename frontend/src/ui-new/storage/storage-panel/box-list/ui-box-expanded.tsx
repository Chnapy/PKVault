import { ActionIcon, Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { PenIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import type { UIExpandableTabsData } from '../../../expandable-tabs/ui-expandable-tabs';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../../interaction/focus-controls/common-controls/select-controls';
import type { PopoverContext } from '../../../interaction/focus-controls/components/popover/context/popover-context';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { UIConfirmPopover } from '../../../popover/ui-confirm-popover';
import { UIPopover } from '../../../popover/ui-popover';
import { getBoxColumns } from '../get-box-columns';
import classes from './ui-box-expanded.module.css';

export type UIBoxExpandedProps = UIExpandableTabsData & {
    slotsStates: boolean[];
    selected: boolean;
    onSelect?: () => void;
    onDelete?: () => void;
    editDropdown: React.ReactNode;
};

export const UIBoxExpanded: React.FC<UIBoxExpandedProps> = ({
    id, label, selected, slotsStates, onSelect, onDelete, editDropdown
}) => {
    const editRef = React.useRef<PopoverContext[ 'setOpened' ]>(null);
    const deleteRef = React.useRef<PopoverContext[ 'setOpened' ]>(null);

    const cols = getBoxColumns(slotsStates.length);

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: `box-expanded-${id}-actions`,
        controls: [
            onSelect && getSelectControl({
                label: 'Select',
                action: () => {
                    onSelect();
                },
            }),
            {
                name: 'edit' as const,
                label: 'Edit',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    },
                },
                spread: false,
                action: () => {
                    editRef.current?.(true);
                },
            },
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
                    deleteRef.current?.(true);
                },
            },
        ],
    });

    return <Group gap='xs' align='stretch' style={{ alignSelf: 'flex-start' }}>
        <WithControlsIcons placement='out' icons={controlsIcons.open}>
            <Button
                variant='default'
                disabled={selected || !onSelect}
                {...focusControlProps}
                h='auto'
                p='md'
                pt={0}
                style={{ gap: 4 }}
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
        </WithControlsIcons>

        <ActionIcon.Group orientation="vertical">
            <UIPopover
                dropdown={editDropdown}
                popoverRef={editRef}
            >
                <WithControlsIcons placement='out' icons={controlsIcons.edit}>
                    <ActionIcon color='blue' disabled={!editDropdown}>
                        <PenIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIPopover>

            <UIConfirmPopover
                label='Delete'
                color='red'
                action={onDelete}
                popoverRef={deleteRef}
            >
                <WithControlsIcons placement='out' icons={controlsIcons.delete}>
                    <ActionIcon color='red' disabled={selected || !onDelete} style={{
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    }}>
                        <TrashIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIConfirmPopover>
        </ActionIcon.Group>
    </Group>;
};
