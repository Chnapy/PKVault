import { ActionIcon, Group, Tabs, Text } from '@mantine/core';
import { CirclePlusIcon, LandmarkIcon } from 'lucide-react';
import type React from 'react';
import { UIExpandableTabs } from '../expandable-tabs/ui-expandable-tabs';
import { UIBankExpanded } from './ui-bank-expanded';
import classes from './ui-bank-list.module.css';

type Data = {
    id: string;
    label: string;
    boxCount: number;
    pkmCount: number;
};

export type UIBankListProps = {
    value: string;
    data: Data[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
};

export const UIBankList: React.FC<UIBankListProps> = ({ value, data, onSelect, onDelete }) => {

    return <UIExpandableTabs
        variant="pills"
        value={value}
        data={data}
        onChange={onSelect}
        grow={false}
        __vars={{
            '--mantine-color-body': 'var(--mantine-color-primary-7)',
        }}
        left={<LandmarkIcon />}
        renderTab={({ item }) => <Tabs.Tab
            key={item.id}
            className={classes.uiBankItem}
            color='primary.6'
            value={item.id}
            py={0}
        >
            <Text display='flex' style={{ alignItems: 'center' }}>
                {item.label}
            </Text>
        </Tabs.Tab>}
        renderExpanded={(data, { reduce }) => <Group>
            {data.map(({ item, selected }) => <UIBankExpanded
                key={item.id}
                {...item}
                selected={selected}
                onSelect={reduce}
                onDelete={() => onDelete(item.id)}
            />)}

            <ActionIcon
                variant='subtle'
                size='xl'
                color='currentcolor'
            >
                <CirclePlusIcon />
            </ActionIcon>
        </Group>}
    />;
};
