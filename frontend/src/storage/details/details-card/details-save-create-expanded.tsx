import { Tooltip } from '@mantine/core';
import type React from 'react';
import { UIDetailsSaveExpanded } from '../../../ui/storage/storage-details/saves/ui-details-save-expanded';
import { useDetailsTabCreateProps, type DetailsTabCreateCommonProps } from './hooks/use-details-tab-create-props';

export const DetailsSaveCreateExpanded: React.FC<DetailsTabCreateCommonProps & {
    onCreate: () => unknown;
}> = ({ context, version, onCreate }) => {
    const { tooltip, ...props } = useDetailsTabCreateProps({ context, version });

    return <Tooltip label={tooltip}>
        <UIDetailsSaveExpanded
            {...props}
            onSelect={onCreate}
        />
    </Tooltip>;
};
