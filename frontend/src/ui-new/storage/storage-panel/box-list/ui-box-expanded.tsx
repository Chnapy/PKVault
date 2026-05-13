import { ActionIcon, Button, Group, Popover, SimpleGrid, Stack, Text } from '@mantine/core';
import { PenIcon, TrashIcon } from 'lucide-react';
import type React from 'react';
import { getBoxColumns } from '../get-box-columns';
import classes from './ui-box-expanded.module.css';

type UIBoxExpandedProps = {
    id: string | number;
    label: string;
    slotsStates: boolean[];
    selected: boolean;
    onSelect: () => void;
    onDelete: () => void;
};

export const UIBoxExpanded: React.FC<UIBoxExpandedProps> = ({
    id, label, selected, slotsStates, onSelect, onDelete
}) => {
    const cols = getBoxColumns(slotsStates.length);

    return <Group gap='xs' align='stretch' style={{ alignSelf: 'stretch' }}>
        <Button
            variant='default'
            disabled={selected}
            onClick={onSelect}
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
                >
                    {slotsStates.map((state, i) => <span
                        key={i}
                        data-enabled={state || undefined}
                    />)}
                </SimpleGrid>
            </Stack>
        </Button>

        <ActionIcon.Group orientation="vertical">
            <ActionIcon color='blue'>
                <PenIcon />
            </ActionIcon>

            <Popover withArrow position='right-start'>
                <Popover.Target>
                    <ActionIcon color='red' disabled={selected}>
                        <TrashIcon />
                    </ActionIcon>
                </Popover.Target>

                <Popover.Dropdown>
                    <Button
                        variant='outline'
                        color='red'
                        onClick={onDelete}
                    >
                        Confirm
                    </Button>
                </Popover.Dropdown>
            </Popover>
        </ActionIcon.Group>
    </Group>;
};
