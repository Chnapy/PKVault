import { ActionIcon, Flex, Group, Scroller, Tabs, Text } from '@mantine/core';
import { CirclePlusIcon, EllipsisVerticalIcon } from 'lucide-react';
import type React from 'react';
import { uiFrameBg } from '../frame/ui-frame-bg.module.css';
import classes from './ui-bank-list.module.css';

// TODO
type Data = { value: string; label: string; selected?: boolean };

export type UIBankListProps = {
    data: Data[];
};

export const UIBankList: React.FC<UIBankListProps> = ({ data }) => {

    return <Group wrap='nowrap' gap='xs' miw={0} maw={'100%'}>
        <Tabs
            variant="pills"
            value='1'
            miw={0}
        >
            <Tabs.List>
                <Scroller edgeGradientColor='primary.7'>
                    {data.map(item => <Flex
                        key={item.label}
                        className={classes.uiBankItem}
                        align='center'
                    >
                        <Tabs.Tab
                            className={item.selected ? undefined : uiFrameBg}
                            value={item.value}
                            p='sm'
                            py={0}
                        >
                            <Text
                                size='sm'
                                display='flex' style={{ alignItems: 'center' }}>
                                {item.label}
                                {/* | 5 <UIAlphaIcon /><Space w='4px' />5 <UIShinyIcon /> */}
                            </Text>
                        </Tabs.Tab>

                        <ActionIcon className={uiFrameBg}
                            size='xs'
                            c='inherit' opacity={item.selected ? undefined : 0}>
                            {/* dropdown with edit/remove actions */}
                            <EllipsisVerticalIcon />
                        </ActionIcon>
                    </Flex>)}
                </Scroller>
            </Tabs.List>
        </Tabs>

        <ActionIcon className={uiFrameBg} size='xs'>
            <CirclePlusIcon />
        </ActionIcon>
    </Group>;
};
