import { ActionIcon, Group } from '@mantine/core';
import { CirclePlusIcon, LandmarkIcon } from 'lucide-react';
import type React from 'react';
import { UISubHeader, type UISubHeaderProps, type UISubHeaderTabsData } from '../layout/header/ui-sub-header';
import { UIBankExpanded, type UIBankData } from './ui-bank-expanded';

export type UIBankTabData = UIBankData & UISubHeaderTabsData;;

export type UIBankListProps =
    & Pick<UISubHeaderProps<UIBankTabData>, 'data' | 'value' | 'onChange'>
    & {
        onCreate: () => void;
        onDelete: (id: string) => void;
    };

export const UIBankList: React.FC<UIBankListProps> = ({ onCreate, onDelete, ...rest }) => {
    return <UISubHeader<UIBankTabData>
        controlsLabel='Change bank'
        controlsDetailsLabel='See all banks'
        left={<LandmarkIcon />}
        renderExpanded={(data, { reduce }) => <Group>
            {data.map(({ item, selected }) => <UIBankExpanded
                key={item.id}
                {...item}
                selected={selected}
                onSelect={reduce}
                onDelete={() => onDelete(item.id)}
            />)}

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
