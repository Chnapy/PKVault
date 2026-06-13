import { ActionIcon, Divider, Group, Menu, Text } from '@mantine/core';
import { BoxIcon, CalendarSyncIcon, CirclePlusIcon, EllipsisVerticalIcon, SortDescIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIExpandableTabs, type UIExpandableTabsData, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIActionIcon } from '../../../form/button/ui-action-icon';
import { Focus } from '../../../interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../../../interaction/focus/scope/use-focus-scope-context';
import { UIMenu } from '../../../popover/ui-menu';
import { UIPopover } from '../../../popover/ui-popover';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import classes from './ui-storage-panel-box-list.module.css';

export type UIBoxData = UIExpandableTabsData & {
    id: string;
    label: string;
};

export type UIStoragePanelBoxListProps = Pick<UIExpandableTabsProps<UIExpandableTabsData>, 'value' | 'data' | 'renderTab' | 'renderExpanded'> & {
    onSelect: (id: string) => void;
    onCreate?: () => void;
    advancedActionSort: React.ReactNode;
    advancedDexSync: React.ReactNode;
};

export const UIStoragePanelBoxList: React.FC<UIStoragePanelBoxListProps> = ({
    value, data, renderTab, renderExpanded, onSelect, onCreate, advancedActionSort, advancedDexSync
}) => {
    const { t } = useTranslate();

    const parentScope = useFocusScopeContext();
    const scopeActive = Focus.useIsScopeActive(parentScope.scopeId);

    const { isInCurrentPanel } = useCurrentPanel();

    return <Group align='flex-start' wrap='nowrap'>
        <UIExpandableTabs
            id='boxes'
            level={1}
            controlsEnabled={scopeActive && isInCurrentPanel}
            controlsLabel='Change box'
            controlsDetailsLabel='See all boxes'
            className={classes.uiStoragePanelBoxList}
            variant='pills'
            value={value}
            data={data}
            onChange={onSelect}
            left={<BoxIcon style={{ flexShrink: 0 }} />}
            renderTab={renderTab}
            renderExpanded={(data, opt) => <Group>
                {renderExpanded?.(data, opt)}

                {onCreate && <UIActionIcon
                    name='create-box'
                    controlLabel='Create box'
                    variant='default'
                    size='xl'
                    onClick={onCreate}
                >
                    <CirclePlusIcon />
                </UIActionIcon>}
            </Group>}
            right={<>
                <Divider orientation="vertical" h='1lh' />

                <UIMenu
                    position="bottom-end" closeOnItemClick={false}
                    dropdown={<>
                        <UIPopover
                            position='right-start'
                            dropdown={advancedActionSort}
                        >
                            <Menu.Item leftSection={<SortDescIcon />}>
                                <Text>
                                    {t('storage.box.advanced.sort')}
                                </Text>
                            </Menu.Item>
                        </UIPopover>

                        <UIPopover
                            position='right-start'
                            dropdown={advancedDexSync}
                        >
                            <Menu.Item leftSection={<CalendarSyncIcon />}>
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
