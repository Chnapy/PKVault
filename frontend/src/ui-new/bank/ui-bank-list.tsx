import { ActionIcon, Group } from '@mantine/core';
import { CirclePlusIcon, LandmarkIcon } from 'lucide-react';
import type React from 'react';
import { UISubHeader, type UISubHeaderProps, type UISubHeaderTabsData } from '../layout/header/sub-header/ui-sub-header';
import { UIBankItem, type UIBankItemProps } from './ui-bank-item';

export type UIBankTabData<C = unknown> = UIBankItemProps<C> & UISubHeaderTabsData;;

export type UIBankListProps =
    & Pick<UISubHeaderProps<UIBankTabData>, 'data' | 'value' | 'onChange' | 'renderExpanded'>
    & {
        onCreate: () => void;
    };

export const UIBankList: React.FC<UIBankListProps> = ({ onCreate, renderExpanded, ...rest }) => {
    return <UISubHeader<UIBankTabData>
        controlsLabel='Change bank'
        controlsDetailsLabel='See all banks'
        left={<LandmarkIcon />}
        renderTab={({ item }) => <UIBankItem
            key={item.id}
            {...item}
        />}
        renderExpanded={(data, opt) => <Group>
            {renderExpanded?.(data, opt)}

            <ActionIcon
                variant='subtle'
                size='xl'
                color='currentcolor'
                onClick={onCreate}
            >
                <CirclePlusIcon />
            </ActionIcon>
        </Group>}
        {...rest}
    />;
};
