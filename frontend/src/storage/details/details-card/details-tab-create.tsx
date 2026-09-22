import { Tooltip } from '@mantine/core';
import type React from 'react';
import { UIDetailsSaveTab } from '../../../ui/storage/storage-details/saves/ui-details-save-tab';
import { useDetailsTabCreateProps, type DetailsTabCreateCommonProps } from './hooks/use-details-tab-create-props';

export const DetailsTabCreate: React.FC<DetailsTabCreateCommonProps & {
    loading?: boolean;
}> = ({ context, version, loading }) => {
    const { tooltip, ...props } = useDetailsTabCreateProps({ context, version });

    return <Tooltip label={tooltip} disabled={loading}>
        <UIDetailsSaveTab
            {...props}
            selected={false}
            loading={loading}
        />
    </Tooltip>;
};
