import type React from 'react';
import { UIDetailsSaveExpanded } from '../../../ui/storage/storage-details/saves/ui-details-save-expanded';
import { useDetailsTabProps } from './hooks/use-details-tab-props';

export const DetailsSaveExpanded: React.FC<{
    id: string;
    selected?: boolean;
    warning?: boolean;
    onSelect: () => void;
}> = ({ id, selected, warning, onSelect }) => {
    const props = useDetailsTabProps({ id, saveId: null });

    return <UIDetailsSaveExpanded
        {...props}
        selected={selected}
        warning={warning}
        onSelect={onSelect}
    />;
};
