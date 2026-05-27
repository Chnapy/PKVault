import { ActionIcon, Group } from '@mantine/core';
import { CirclePlusIcon, LandmarkIcon } from 'lucide-react';
import type React from 'react';
import { UISubHeader, type UISubHeaderProps } from '../layout/header/ui-sub-header';
import { UIBankExpanded, type UIBankData } from './ui-bank-expanded';

export type UIBankListProps =
    & Pick<UISubHeaderProps<UIBankData>, 'data' | 'value' | 'onChange'>
    & {
        onDelete: (id: string) => void;
    };

export const UIBankList: React.FC<UIBankListProps> = ({ onDelete, ...rest }) => {
    return <UISubHeader<UIBankData>
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
            >
                <CirclePlusIcon />
            </ActionIcon>
        </Group>}
        {...rest}
    />;
};
