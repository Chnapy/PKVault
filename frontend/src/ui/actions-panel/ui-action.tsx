import { Badge, Group, Tooltip } from '@mantine/core';
import type React from 'react';
import { DataActionType } from '../../data/sdk/model';
import { UISpriteSizeWrapper } from '../sprite-img/ui-sprite-size-wrapper';
import { getActionColor } from './utils/get-action-color';

export type UIActionProps = {
    type: DataActionType;
    label: React.ReactNode;
    description: string;
};

export const UIAction: React.FC<UIActionProps> = ({ type, label, description }) => {
    return <Tooltip label={description}>
        <UISpriteSizeWrapper
            speciesSize='xs'
            component={Badge<'div'>}
            variant='dot' color={getActionColor(type)}
            size='lg' px='md'
            fz='md' fw='normal' tt='initial' style={{ cursor: 'inherit' }}
        >
            <Group gap='sm'>
                {label}
            </Group>
        </UISpriteSizeWrapper>
    </Tooltip>;
};
