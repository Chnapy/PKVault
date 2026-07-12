import { Group, HoverCard, Tabs, Text } from '@mantine/core';
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
    renderHoverCard: UIExpandableTabsProps<UIGameData>[ 'renderTab' ];
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ value, data, onChange, renderExpanded, renderHoverCard, expanded }) => {
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
        renderTab={(params, opt) => <HoverCard>
            <HoverCard.Target>
                <Tabs.Tab key={params.item.id}
                    value={params.item.id} onClick={opt.reduce} disabled={params.item.disabled}
                    leftSection={<img src={params.item.imgSrc} height={16} />} py={4}
                >
                    <Text component={params.selected ? 'b' : undefined} textWrap='nowrap'>{params.item.label}</Text>
                </Tabs.Tab>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                {renderHoverCard(params, opt)}
            </HoverCard.Dropdown>
        </HoverCard>}
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
