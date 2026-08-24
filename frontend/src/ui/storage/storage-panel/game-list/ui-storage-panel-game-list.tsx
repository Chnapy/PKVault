import { Card, Group, Tabs, Text, Tooltip } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIExpandableTabs, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { UISelect, type UISelectItem } from '../../../form/select/ui-select';
import { UIBallIcon } from '../../../icon/ui-ball-icon';
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
    createActions: React.ReactNode;
    renderHoverCard: UIExpandableTabsProps<UIGameData>[ 'renderTab' ];
    sortValue: string;
    sortData: UISelectItem<string>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSortChange: (value: any) => void;
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({
    value, data, onChange, renderExpanded, renderHoverCard, expanded, createActions, sortValue, sortData, onSortChange
}) => {
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
        renderExpanded={(data, opt) => <Card withBorder={false} bdrs={0}>
            <Card.Section withBorder inheritPadding h={33} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
            }}>
                <UIBallIcon />
                <Text>
                    {t('storage.games.title')}
                </Text>

                <UISelect
                    name='saves-sort'
                    controlLabel={t('action.select')}
                    value={sortValue}
                    data={sortData}
                    onChange={onSortChange}
                    __vars={() => ({
                        '--input-height': '25px',
                        '--input-size': '25px',
                    })}
                    ml='auto'
                />
            </Card.Section>

            <Card.Section withBorder inheritPadding py='inherit'>
                <Group align='flex-start'>
                    {renderExpanded?.(data, opt)}

                    {createActions}
                </Group>
            </Card.Section>
        </Card>}
    />;
};
