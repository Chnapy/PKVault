import { css } from '@emotion/css';
import { ActionIcon, Flex, Group, OverflowList, Tabs, Text } from '@mantine/core';
import { ChevronDown, MoreVertical, Plus } from 'pixelarticons/react';
import type React from 'react';
import { uiFrameBgClassname } from './ui-frame-bg-classname';

// TODO
type Data = { value: string; label: string; selected?: boolean };

export type UIBankListProps = {
    data: Data[];
};

export const UIBankList: React.FC<UIBankListProps> = ({ data }) => {

    return <Group wrap='nowrap' gap='xs'>
        <Tabs variant="pills" value='1' color='white'
            // className={css`
            //   --tab-hover-color: var(--mantine-color-primary-6) !important;
            // `}
            style={{ flexGrow: 1 }}>
            <Tabs.List>
                <OverflowList<Data>
                    style={{ flexGrow: 1 }}
                    gap={4}
                    data={data}
                    renderItem={(item) => <Flex
                        className={css({
                            '&:hover > .mantine-ActionIcon-root': {
                                opacity: '1 !important',
                            },
                        })}
                    >
                        <Tabs.Tab
                            className={item.selected ? undefined : uiFrameBgClassname}
                            value={item.value}
                            p='xs'
                            py={0}
                        >
                            <Text size='sm' display='flex' style={{ alignItems: 'center' }}>
                                {item.label}
                                {/* | 5 <UIAlphaIcon /><Space w='4px' />5 <UIShinyIcon /> */}
                            </Text>
                        </Tabs.Tab>

                        <ActionIcon className={uiFrameBgClassname} size='xs' c='inherit' opacity={item.selected ? undefined : 0}>
                            {/* dropdown with edit/remove actions */}
                            <MoreVertical />
                        </ActionIcon>
                    </Flex>}
                    renderOverflow={(items) => <ActionIcon className={uiFrameBgClassname} size='xs' style={{ flexGrow: 1 }}>
                        <ChevronDown />
                    </ActionIcon>}
                />
            </Tabs.List>
        </Tabs>

        <ActionIcon className={uiFrameBgClassname} size='xs'>
            <Plus />
        </ActionIcon>
    </Group>;
};
