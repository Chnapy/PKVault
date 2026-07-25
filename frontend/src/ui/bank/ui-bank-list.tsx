import { Group, Tooltip } from '@mantine/core';
import { CirclePlusIcon, LandmarkIcon } from 'lucide-react';
import type React from 'react';
import { UIActionIcon } from '../form/button/ui-action-icon';
import { UISubHeader, type UISubHeaderProps, type UISubHeaderTabsData } from '../layout/header/sub-header/ui-sub-header';
import { UIBankItem, type UIBankItemProps } from './ui-bank-item';
import { useTranslate } from '../../translate/i18n';

export type UIBankTabData<C = unknown> = UIBankItemProps<C> & UISubHeaderTabsData;;

export type UIBankListProps =
    & Pick<UISubHeaderProps<UIBankTabData>, 'data' | 'value' | 'onChange' | 'renderExpanded'>
    & {
        onCreate: () => void;
    };

export const UIBankList: React.FC<UIBankListProps> = ({ onCreate, renderExpanded, ...rest }) => {
    const { t } = useTranslate();

    return <UISubHeader<UIBankTabData>
        controlsLabel={t('storage.bank.controls-label')}
        controlsDetailsLabel={t('storage.bank.controls-label-details')}
        left={<LandmarkIcon />}
        renderTab={({ item }) => <UIBankItem
            key={item.id}
            {...item}
        />}
        renderExpanded={(data, opt) => <Group pt='sm'>
            {renderExpanded?.(data, opt)}

            <Tooltip label={t('storage.bank.create.label')}>
                <UIActionIcon
                    name='bank-create'
                    controlLabel={t('storage.bank.create.label')}
                    variant='subtle'
                    size='xl'
                    color='currentcolor'
                    onClick={onCreate}
                >
                    <CirclePlusIcon />
                </UIActionIcon>
            </Tooltip>
        </Group>}
        {...rest}
    />;
};
