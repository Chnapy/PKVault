import { ActionIcon, Divider, Group, Menu, Text, Tooltip } from '@mantine/core';
import { BoxIcon, CalendarSyncIcon, CirclePlusIcon, EllipsisVerticalIcon, SortDescIcon } from 'lucide-react';
import React from 'react';
import type { BoxType } from '../../../../data/sdk/model';
import { useTranslate } from '../../../../translate/i18n';
import { UIExpandableTabs, type UIExpandableTabsData, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIActionIcon } from '../../../form/button/ui-action-icon';
import { UIMenu } from '../../../popover/ui-menu';
import { UIPopover } from '../../../popover/ui-popover';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import classes from './ui-storage-panel-box-list.module.css';

export type UIBoxData = UIExpandableTabsData & {
    type: BoxType;
};

export type UIStoragePanelBoxListProps = Pick<UIExpandableTabsProps<UIBoxData>, 'value' | 'data' | 'renderTab' | 'renderExpanded'> & {
    onSelect: (id: string) => void;
    onCreate?: () => unknown;
    advancedActionSort: React.ReactNode;
    advancedDexSync: React.ReactNode;
};

export const UIStoragePanelBoxList: React.FC<UIStoragePanelBoxListProps> = ({
    value, data, renderTab, renderExpanded, onSelect, onCreate, advancedActionSort, advancedDexSync
}) => {
    const { t } = useTranslate();

    const { isInCurrentPanel } = useCurrentPanel();

    return <Group align='flex-start' wrap='nowrap'>
        <UIExpandableTabs<UIBoxData>
            id='boxes'
            level={1}
            controlsEnabled={isInCurrentPanel}
            controlsLabel='Change box'
            controlsDetailsLabel='See all boxes'
            className={classes.uiStoragePanelBoxList}
            variant='pills'
            value={value}
            data={data}
            onChange={onSelect}
            left={<BoxIcon style={{ flexShrink: 0 }} />}
            renderTab={renderTab}
            renderExpanded={(data, opt) => <Group py='md' px='xs'>
                {renderExpanded?.(data, opt)}

                {onCreate && <Tooltip label='Create new box'>
                    <UIActionIcon
                        name='create-box'
                        controlLabel='Create box'
                        variant='default'
                        size='xl'
                        w='100%'
                        onClick={onCreate}
                    >
                        <CirclePlusIcon />
                    </UIActionIcon>
                </Tooltip>}
            </Group>}
            right={<>
                <Divider orientation="vertical" h='1lh' />

                <UIMenu
                    position="bottom-end"
                    closeOnItemClick={false}
                    closeOnClickOutside
                    dropdown={<>
                        <UIPopover
                            position='right-start'
                            dropdown={advancedActionSort}
                            dropdownProps={{ w: 350 }}
                            nested
                        >
                            <Menu.Item leftSection={<SortDescIcon />} fz='md'>
                                <Text>
                                    {t('storage.box.advanced.sort')}
                                </Text>
                            </Menu.Item>
                        </UIPopover>

                        <UIPopover
                            position='right-start'
                            dropdown={advancedDexSync}
                            dropdownProps={{ w: 350 }}
                            nested
                        >
                            <Menu.Item leftSection={<CalendarSyncIcon />} fz='md'>
                                <Text>
                                    {t('storage.box.advanced.dex-sync')}
                                </Text>
                            </Menu.Item>
                        </UIPopover>
                    </>}
                >
                    <ActionIcon variant='subtle' size='sm' p='xs' color='currentcolor'>
                        <EllipsisVerticalIcon />
                    </ActionIcon>
                </UIMenu>

            </>}
        />
    </Group>
};
