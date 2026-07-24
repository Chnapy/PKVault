import { ActionIcon, Button, Group, SimpleGrid, Stack, Text, type ButtonProps } from '@mantine/core';
import { PenIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import type { UIExpandableTabsData } from '../../../expandable-tabs/ui-expandable-tabs';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { UIConfirmPopover } from '../../../popover/ui-confirm-popover';
import { UIPopover } from '../../../popover/ui-popover';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { getBoxColumns } from '../get-box-columns';
import classes from './ui-box-expanded.module.css';

export type UIBoxExpandedProps = UIExpandableTabsData & {
    slotsStates: boolean[];
    selected: boolean;
    onSelect?: () => void;
    onDelete?: () => void;
    color?: ButtonProps[ 'color' ];
    editDropdown: React.ReactNode;
};

export const UIBoxExpanded: React.FC<UIBoxExpandedProps> = ({
    id, label, selected, slotsStates, onSelect, onDelete, color, editDropdown
}) => {
    const panel = useCurrentPanel();

    const cols = getBoxColumns(slotsStates.length);

    const selectDisabled = selected || !onSelect;
    const editDisabled = !editDropdown;
    const deleteDisabled = selected || !onDelete;

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: `box-expanded-${id}-actions`,
        focusOnMount: selected,
        onFocus: () => {
            panel.normalizeCurrentPanel();
        },
        controls: [
            !selectDisabled && getSelectControl({
                label: 'Select',
                action: () => {
                    onSelect();
                },
            }),
            !editDisabled && {
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
            !deleteDisabled && {
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
        ],
    });

    return <Group gap='xs' align='stretch' style={{ alignSelf: 'flex-start' }}>
        <WithControlsIcons placement='out' icons={controlIcons('open')}>
            <Button
                variant='default'
                c={color}
                bd={color && '1px solid currentcolor'}
                {...focusProps}
                {...controlProps('open')}
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
            >
                <WithControlsIcons placement='out' icons={controlIcons('edit')}>
                    <ActionIcon color='blue' {...controlProps('edit')} style={{
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    }}>
                        <PenIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIPopover>

            <UIConfirmPopover
                label='Delete'
                color='red'
                action={onDelete}
            >
                <WithControlsIcons placement='out' icons={controlIcons('delete')}>
                    <ActionIcon color='red' {...controlProps('delete')} style={{
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
