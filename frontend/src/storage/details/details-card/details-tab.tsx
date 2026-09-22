import type React from 'react';
import type { UIExpandableTabsData } from '../../../ui/expandable-tabs/ui-expandable-tabs';
import { UIDetailsSaveTab } from '../../../ui/storage/storage-details/saves/ui-details-save-tab';
import { useDetailsTabProps } from './hooks/use-details-tab-props';

export type DetailsTabProps = Pick<UIExpandableTabsData, 'id'> & {
    saveId: number | null;
    selected?: boolean;
    warning?: boolean;
};

export const DetailsTab: React.FC<DetailsTabProps> = ({ id, saveId, warning, selected = false }) => {
    const props = useDetailsTabProps({ id, saveId });

    return <UIDetailsSaveTab
        {...props}
        selected={selected}
        warning={warning}
    />;
};
