import { Badge, Tooltip } from '@mantine/core';
import type React from 'react';
import { DataActionType } from '../../data/sdk/model';
import { useActionLabel } from './hooks/use-action-label';
import { getActionColor } from './utils/get-action-color';

export type UIActionProps = {
    type: DataActionType;
    description: string;
};

export const UIAction: React.FC<UIActionProps> = ({ type, description }) => {
    const getLabel = useActionLabel();

    return <Tooltip label={description}>
        <Badge variant='dot' color={getActionColor(type)} size='lg' fz='md' fw='normal' tt='initial' style={{ cursor: 'inherit' }}>
            {getLabel(type)}
        </Badge>
    </Tooltip>;
};
