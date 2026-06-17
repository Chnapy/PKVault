import { Badge } from '@mantine/core';
import type React from 'react';
import { DataActionType } from '../../data/sdk/model';
import { useActionLabel } from './hooks/use-action-label';
import { getActionColor } from './utils/get-action-color';

export type UIActionProps = {
    type: DataActionType;
    // params: unknown[];
};

export const UIAction: React.FC<UIActionProps> = ({ type }) => {
    const getLabel = useActionLabel();

    return <Badge variant='dot' color={getActionColor(type)} size='lg' fz='md' fw='normal' tt='initial' style={{ pointerEvents: 'none' }}>
        {getLabel(type)}
    </Badge>;
};
