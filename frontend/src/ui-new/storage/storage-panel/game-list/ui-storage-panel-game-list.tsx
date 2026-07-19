import { Group, Tabs, Text, Tooltip } from '@mantine/core';
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

export type UIStoragePanelGameListProps = Pick<UIExpandableTabsProps<UIGameData>, 'value' | 'data' | 'onChange' | 'renderExpanded' | 'expanded'> & {
    onCreate: () => unknown;
    renderHoverCard: UIExpandableTabsProps<UIGameData>[ 'renderTab' ];
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ value, data, onChange, renderExpanded, renderHoverCard, expanded, onCreate }) => {
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
        renderTab={(params, opt) => <Tooltip key={params.item.id} label={renderHoverCard(params, opt)} color='transparent'>
            <Tabs.Tab
                value={params.item.id} onClick={opt.reduce} disabled={params.item.disabled}
                leftSection={<img src={params.item.imgSrc} height={16} />} py={4}
            >
                <Text component={params.selected ? 'b' : undefined} textWrap='nowrap'>{params.item.label}</Text>
            </Tabs.Tab>
        </Tooltip>}
        renderExpanded={(data, opt) => <Group
            align='flex-start'
            p='md'
            bg='var(--mantine-color-body-default)'
        >
            {renderExpanded?.(data, opt)}

            <Tooltip label='Add saves in settings'>
                <UIActionIcon
                    name='add-game'
                    controlLabel='Add game'
                    variant='default'
                    size='xl'
                    w='100%'
                    onClick={onCreate}
                >
                    <CirclePlusIcon />
                </UIActionIcon>
            </Tooltip>
        </Group>}
    />;
};
