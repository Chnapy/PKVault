import type React from 'react';
import { UIDetailsSaveExpanded } from '../../../ui/storage/storage-details/saves/ui-details-save-expanded';
import type { DetailsTabProps } from './details-tab';
import { useDetailsTabProps } from './hooks/use-details-tab-props';

export const DetailsSaveExpanded: React.FC<Pick<DetailsTabProps, 'id' | 'selected' | 'attached' | 'warning'> & {
    onSelect: () => void;
}> = ({ id, onSelect, ...rest }) => {
    const props = useDetailsTabProps({ id, saveId: null });

    return <UIDetailsSaveExpanded
        {...rest}
        {...props}
        onSelect={onSelect}
    />;
};
