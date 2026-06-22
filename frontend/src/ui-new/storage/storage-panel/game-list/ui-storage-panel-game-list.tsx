import { Group, Tabs, Text } from '@mantine/core';
import { CirclePlusIcon } from 'lucide-react';
import type React from 'react';
import { UIExpandableTabs, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIActionIcon } from '../../../form/button/ui-action-icon';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';

export type UIGameData = {
    id: string;
    label: string;
    imgSrc: string;
    disabled?: boolean;
};

export type UIStoragePanelGameListProps = Pick<UIExpandableTabsProps<UIGameData>, 'value' | 'data' | 'onChange' | 'renderExpanded' | 'expanded'>;

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ value, data, onChange, renderExpanded, expanded }) => {
    const { isInCurrentPanel } = useCurrentPanel();

    return <UIExpandableTabs
        id='games'
        level={2}
        controlsEnabled={isInCurrentPanel}
        controlsLabel='Change game'
        controlsDetailsLabel='See all games'
        value={value}
        data={data}
        onChange={onChange}
        expanded={expanded}
        scoped={expanded !== true}
        renderTab={({ item, selected }, { reduce }) => <Tabs.Tab key={item.id}
            value={item.id} onClick={reduce} disabled={item.disabled} leftSection={<img src={item.imgSrc} height={16} />} py={4}
        >
            <Text component={selected ? 'b' : undefined} textWrap='nowrap'>{item.label}</Text>
        </Tabs.Tab>}
        renderExpanded={(data, opt) => <Group
            align='flex-start'
            p='md'
            bg='var(--mantine-color-body-default)'
        >
            {renderExpanded?.(data, opt)}

            <UIActionIcon
                name='add-game'
                controlLabel='Add game'
                variant='default'
                size='xl'
                w='100%'
            >
                <CirclePlusIcon />
            </UIActionIcon>
        </Group>}
    />;
};
