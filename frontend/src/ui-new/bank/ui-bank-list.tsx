import { ActionIcon, Tabs, Text } from '@mantine/core';
import { CirclePlusIcon } from 'lucide-react';
import type React from 'react';
import { UIExpandableTabs } from '../expandable-tabs/ui-expandable-tabs';
import classes from './ui-bank-list.module.css';

// TODO
type Data = { id: string; label: string };

export type UIBankListProps = {
    data: Data[];
};

export const UIBankList: React.FC<UIBankListProps> = ({ data }) => {

    return <UIExpandableTabs
        variant="pills"
        value='1'
        data={data}
        grow={false}
        renderTab={({ item }) => <Tabs.Tab
            key={item.id}
            className={classes.uiBankItem}
            color='primary.6'
            value={item.id}
            py={0}
        >
            <Text
                display='flex' style={{ alignItems: 'center' }}>
                {item.label}
                {/* | 5 <UIAlphaIcon /><Space w='4px' />5 <UIShinyIcon /> */}
            </Text>
        </Tabs.Tab>}
        renderExpandedTab={() => null}
        actions={
            <ActionIcon
                variant='subtle'
                size='sm'
                p='xs'
                color='currentcolor'
            >
                <CirclePlusIcon />
            </ActionIcon>
        }
    />;
};
