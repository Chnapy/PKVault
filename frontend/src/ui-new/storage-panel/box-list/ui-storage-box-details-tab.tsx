import { ActionIcon, Group, SimpleGrid, Tabs, Text } from '@mantine/core';
import { PenIcon, TrashIcon } from 'lucide-react';
import type React from 'react';
import { getBoxColumns } from '../get-box-columns';
import classes from './ui-storage-box-details-tab.module.css';

type UIStorageBoxDetailsTabProps = {
    id: string | number;
    label: string;
    selected: boolean;
    onClick: () => void;

    slotsStates: boolean[];
};

export const UIStorageBoxDetailsTab: React.FC<UIStorageBoxDetailsTabProps> = ({
    id, label, selected, onClick, slotsStates
}) => {
    const cols = getBoxColumns(slotsStates.length);

    return <Group gap='xs' align='stretch' style={{ alignSelf: 'stretch' }}>
        <Tabs.Tab
            value={id.toString()}
            onClick={onClick}
            p='md'
            pt={0}
            style={{ alignItems: 'flex-start' }}
        >
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
        </Tabs.Tab>

        <ActionIcon.Group orientation="vertical">
            <ActionIcon size='sm' color='blue'>
                <PenIcon height={'0.8em'} />
            </ActionIcon>
            <ActionIcon size='sm' color='red'>
                <TrashIcon height={'0.8em'} />
            </ActionIcon>
        </ActionIcon.Group>
    </Group>;
};
