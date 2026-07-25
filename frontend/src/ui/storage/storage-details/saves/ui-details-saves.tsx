import { Group } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIExpandableTabs, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIDetailsSaveExpanded, type UIDetailsSaveData } from './ui-details-save-expanded';

export type UIDetailsSavesProps = Pick<UIExpandableTabsProps<UIDetailsSaveData>, 'value' | 'data' | 'renderTab' | 'renderExpanded'> & {
    onSelect: (id: string) => void;
    actions: React.ReactNode;
};

export const UIDetailsSaves: React.FC<UIDetailsSavesProps> = ({ onSelect, actions, ...rest }) => {
    const { t } = useTranslate();

    return <UIExpandableTabs
        id='saves'
        level={2}
        controlsEnabled
        controlsLabel={t('details.variant.controls-label')}
        controlsDetailsLabel={t('details.variant.controls-label-details')}
        onChange={onSelect}
        renderExpanded={(data, { reduce }) => <Group
            p='md'
        >
            {data.map(({ item, selected }) => <UIDetailsSaveExpanded
                key={item.id}
                {...item}
                selected={selected}
                onSelect={() => {
                    onSelect(item.id);
                    reduce();
                }}
            />)}
        </Group>}
        right={actions}
        {...rest}
    />;
};
