import { ActionIcon, Checkbox, Divider, Group, Tabs, Text } from '@mantine/core';
import { BoxIcon, CirclePlusIcon, EllipsisVerticalIcon } from 'lucide-react';
import React from 'react';
import { UIExpandableTabs, type UIExpandableTabsData, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { Focus } from '../../../interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../../../interaction/focus/scope/use-focus-scope-context';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import classes from './ui-storage-panel-box-list.module.css';

export type UIBoxData = UIExpandableTabsData & {
    id: string;
    label: string;
};

export type UIStoragePanelBoxListProps = Pick<UIExpandableTabsProps<UIExpandableTabsData>, 'value' | 'data' | 'renderExpanded'> & {
    onSelect: (id: string) => void;
    onCreate?: () => void;
};

export const UIStoragePanelBoxList: React.FC<UIStoragePanelBoxListProps> = ({ value, data, renderExpanded, onSelect, onCreate }) => {
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
            variant='pills'
            value={value}
            data={data}
            onChange={onSelect}
            left={<BoxIcon style={{ flexShrink: 0 }} />}
            renderTab={({ item, selected }) => <Tabs.Tab
                key={item.id}
                value={item.id}
                className={classes.uiStoragePanelBoxList}
                py={0}
                style={{ gap: 4 }}
                rightSection={selected && <Checkbox size='xs' />}
            >
                <Text component={selected ? 'b' : undefined}>{item.label}</Text>
            </Tabs.Tab>}
            renderExpanded={(data, opt) => <Group>
                {renderExpanded?.(data, opt)}

                {onCreate && <ActionIcon
                    variant='default'
                    size='xl'
                    onClick={onCreate}
                >
                    <CirclePlusIcon />
                </ActionIcon>}
            </Group>}
            right={<>
                <Divider orientation="vertical" h='1lh' />

                <ActionIcon variant='subtle' size='sm' p='xs' color='currentcolor'>
                    {/* dropdown with advanced actions */}
                    <EllipsisVerticalIcon />
                </ActionIcon>

            </>}
        />
    </Group>
};
