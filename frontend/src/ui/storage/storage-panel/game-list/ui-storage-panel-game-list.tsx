import { Group, Tabs, Text, Tooltip } from '@mantine/core';
import { CirclePlusIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIExpandableTabs, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIActionIcon } from '../../../form/button/ui-action-icon';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';

export type UIGameData = {
    id: string;
    label: string;
    imgSrc: string;
    hasDuplicates?: boolean;
    disabled?: boolean;
};

export type UIStoragePanelGameListProps = Pick<UIExpandableTabsProps<UIGameData>, 'value' | 'data' | 'onChange' | 'renderExpanded' | 'expanded'> & {
    onCreate: () => unknown;
    renderHoverCard: UIExpandableTabsProps<UIGameData>[ 'renderTab' ];
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ value, data, onChange, renderExpanded, renderHoverCard, expanded, onCreate }) => {
    const { t } = useTranslate();

    const { isInCurrentPanel } = useCurrentPanel();

    return <UIExpandableTabs
        id='games'
        level={2}
        controlsEnabled={isInCurrentPanel}
        controlsLabel={t('save.controls-label')}
        controlsDetailsLabel={t('save.controls-label-details')}
        value={value}
        data={data}
        onChange={onChange}
        expanded={expanded}
        scoped={expanded !== true}
        renderTab={(params, opt) => <Tooltip key={params.item.id} label={renderHoverCard(params, opt)} color='transparent'>
            <Tabs.Tab
                value={params.item.id} onClick={opt.reduce} disabled={params.item.disabled}
                leftSection={<img src={params.item.imgSrc} height={16} />}
                rightSection={params.item.hasDuplicates && <UIPokedexIcons.Duplicate />}
                py={4}
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
                    controlLabel={t('save.add')}
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
