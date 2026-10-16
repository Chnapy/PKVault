import type React from 'react';
import { UIDetailsSaveTab, type UIDetailsSaveTabProps } from '../../../ui/storage/storage-details/saves/ui-details-save-tab';
import { useDetailsTabProps } from './hooks/use-details-tab-props';

export type DetailsTabProps = Pick<UIDetailsSaveTabProps, 'id' | 'selected' | 'attached' | 'warning'> & {
    saveId: number | null;
};

export const DetailsTab: React.FC<DetailsTabProps> = ({ id, saveId, ...rest }) => {
    const props = useDetailsTabProps({ id, saveId });

    return <UIDetailsSaveTab
        {...props}
        {...rest}
    />;
};
